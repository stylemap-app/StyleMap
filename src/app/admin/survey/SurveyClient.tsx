"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { PriceRange, TagMaster } from "@/types/store";
import { PRICE_RANGE_OPTIONS, PRICE_JUDGING_CRITERIA } from "@/lib/priceRange";
import { VIBE_GUIDE, VIBE_GUIDE_RULES } from "@/lib/vibeGuide";
import {
  SURVEY_STATUS_LABEL,
  SURVEY_STATUS_BADGE_CLASS,
  type SurveyStatus,
} from "@/lib/surveyStatus";
import { haversineMeters, formatDistance, type LatLng } from "./distance";
import StoreListModal, { type StatusFilter } from "./StoreListModal";
import { saveSurveyResult } from "./actions";

export type SurveyStore = {
  id: string;
  name: string;
  areaName: string;
  lat: number;
  lng: number;
  surveyStatus: SurveyStatus;
  selectedTagIds: number[];
  priceRange: PriceRange | null;
  operatorReview: string;
};

type SortMode = "distance" | "name";

// 店舗を切り替える3手段（前へ／次へ／店舗一覧からの選択）を1つの型で表す。
// 未保存の変更がある場合はここで指定した移動先を一旦保留し、確認モーダルを出す
type NavigationTarget =
  | { kind: "prev" }
  | { kind: "next" }
  | { kind: "select"; storeId: string };

type SurveyDraft = {
  selectedTagIds: number[];
  priceRange: PriceRange | null;
  memo: string;
  savedAt: string;
};

const DRAFT_KEY_PREFIX = "stylemap:survey-draft:";
const LAST_STORE_KEY = "stylemap:survey-last-store";

// localStorageが使えない環境（プライベートモード等のQuotaExceeded含む）でも
// 画面が壊れないよう、下書き関連の読み書きは全てtry/catchで囲む
function readDraft(storeId: string): SurveyDraft | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(DRAFT_KEY_PREFIX + storeId);
    return raw ? (JSON.parse(raw) as SurveyDraft) : null;
  } catch {
    return null;
  }
}

function writeDraft(storeId: string, draft: SurveyDraft) {
  try {
    window.localStorage.setItem(DRAFT_KEY_PREFIX + storeId, JSON.stringify(draft));
  } catch {
    // 書き込めなくても画面は継続動作させる
  }
}

function clearDraft(storeId: string) {
  try {
    window.localStorage.removeItem(DRAFT_KEY_PREFIX + storeId);
  } catch {
    // 同上
  }
}

function draftDiffersFromStore(draft: SurveyDraft, store: SurveyStore): boolean {
  const dbIds = new Set(store.selectedTagIds);
  const draftIds = new Set(draft.selectedTagIds);
  if (dbIds.size !== draftIds.size) return true;
  if (Array.from(draftIds).some((id) => !dbIds.has(id))) return true;
  if (draft.priceRange !== store.priceRange) return true;
  if (draft.memo !== (store.operatorReview ?? "")) return true;
  return false;
}

function readLastStoreId(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(LAST_STORE_KEY);
  } catch {
    return null;
  }
}

function writeLastStoreId(storeId: string) {
  try {
    window.localStorage.setItem(LAST_STORE_KEY, storeId);
  } catch {
    // 同上
  }
}

export default function SurveyClient({
  stores: initialStores,
  allTags,
}: {
  stores: SurveyStore[];
  allTags: TagMaster[];
}) {
  // 保存のたびにサーバーへ再取得しに行かず、ローカル状態を直接更新する
  // （現地での連続入力を優先し、通信は保存の書き込みだけに絞るため）
  const [stores, setStores] = useState(initialStores);
  // リロード後も編集中だった店舗に戻れるよう、直前に開いていた店舗idを復元する
  // （下書き復元バナーは「今開いている店舗」でしか判定しないため、これがないと
  // リロード直後は常に1件目の店舗が開き、編集中だった店舗の下書きに気づけない）
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(() => {
    const last = readLastStoreId();
    if (last && initialStores.some((s) => s.id === last)) return last;
    return initialStores[0]?.id ?? null;
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [finished, setFinished] = useState(false);

  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());
  const [priceRange, setPriceRange] = useState<PriceRange | null>(null);
  const [memo, setMemo] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showPriceCriteria, setShowPriceCriteria] = useState(false);
  const [showVibeGuide, setShowVibeGuide] = useState(false);
  const [pendingNav, setPendingNav] = useState<NavigationTarget | null>(null);
  const [pendingDraft, setPendingDraft] = useState<SurveyDraft | null>(null);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const savedToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredStores = useMemo(() => {
    let list = stores.filter((s) => {
      if (statusFilter === "all") return true;
      return s.surveyStatus === statusFilter;
    });
    if (sortMode === "distance" && userLocation) {
      list = [...list].sort(
        (a, b) =>
          haversineMeters(userLocation, { lat: a.lat, lng: a.lng }) -
          haversineMeters(userLocation, { lat: b.lat, lng: b.lng })
      );
    } else {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ja"));
    }
    return list;
  }, [stores, statusFilter, sortMode, userLocation]);

  const currentIndex = filteredStores.findIndex((s) => s.id === currentStoreId);
  const effectiveIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentStore = filteredStores[effectiveIndex] ?? null;
  const visitedCount = stores.filter((s) => s.surveyStatus === "visited").length;

  // フォームの現在値がDB上の値と異なるか（＝保存し忘れると消える変更があるか）
  const isDirty = useMemo(() => {
    if (!currentStore) return false;
    const dbIds = new Set(currentStore.selectedTagIds);
    if (dbIds.size !== selectedTagIds.size) return true;
    if (Array.from(selectedTagIds).some((id) => !dbIds.has(id))) return true;
    if (priceRange !== currentStore.priceRange) return true;
    if (memo !== (currentStore.operatorReview ?? "")) return true;
    return false;
  }, [currentStore, selectedTagIds, priceRange, memo]);

  // 店舗を切り替えるたびに、その店舗自身の現在値でフォームを初期化する。
  // 併せて、その店舗宛の下書きがDBの値と異なっていれば復元バナーを出す
  useEffect(() => {
    if (!currentStore) return;
    setSelectedTagIds(new Set(currentStore.selectedTagIds));
    setPriceRange(currentStore.priceRange);
    setMemo(currentStore.operatorReview);
    setSaveError(null);
    const draft = readDraft(currentStore.id);
    setPendingDraft(draft && draftDiffersFromStore(draft, currentStore) ? draft : null);
  }, [currentStore?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentStoreId) writeLastStoreId(currentStoreId);
  }, [currentStoreId]);

  // フォームがDBの値と一致している間は書き込まない。
  // 店舗切替直後の初期値セット（=DBの値そのもの）で、既存の下書きを
  // 上書きして消してしまうのを防ぐため（下書きが実際に意味を持つのは差分がある時だけ）
  useEffect(() => {
    if (!currentStore) return;
    if (!isDirty) return;
    writeDraft(currentStore.id, {
      selectedTagIds: Array.from(selectedTagIds),
      priceRange,
      memo,
      savedAt: new Date().toISOString(),
    });
  }, [currentStore, isDirty, selectedTagIds, priceRange, memo]);

  useEffect(() => {
    return () => {
      if (savedToastTimer.current) clearTimeout(savedToastTimer.current);
    };
  }, []);

  const byType = (type: string) => allTags.filter((t) => t.type === type);

  const toggleTag = (id: number) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const requestLocation = () => {
    setGeoError(null);
    if (!("geolocation" in navigator)) {
      setGeoError("この端末では位置情報が使えません（名前順で表示します）");
      setSortMode("name");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortMode("distance");
      },
      () => {
        setGeoError("位置情報を取得できませんでした（名前順で表示します）");
        setSortMode("name");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const resolveTargetId = (target: NavigationTarget): string | null => {
    if (target.kind === "select") return target.storeId;
    if (target.kind === "prev") return filteredStores[effectiveIndex - 1]?.id ?? null;
    return filteredStores[effectiveIndex + 1]?.id ?? null;
  };

  // 保存せずそのまま移動する（未保存の変更がない時、または「破棄して移動」確定後に使う）
  const navigateTo = (target: NavigationTarget) => {
    const targetId = resolveTargetId(target);
    if (!targetId) return;
    setCurrentStoreId(targetId);
    setFinished(false);
    setIsModalOpen(false);
  };

  // 前へ／次へ／店舗一覧からの選択、すべてここを経由する。
  // 未保存の変更があれば直接は移動せず、確認モーダルを開く
  const requestNavigate = (target: NavigationTarget) => {
    if (target.kind === "select") setIsModalOpen(false);
    if (isDirty) {
      setPendingNav(target);
    } else {
      navigateTo(target);
    }
  };

  const showSavedToast = (name: string) => {
    setSavedToast(name);
    if (savedToastTimer.current) clearTimeout(savedToastTimer.current);
    savedToastTimer.current = setTimeout(() => setSavedToast(null), 2000);
  };

  const runSave = async (status: "visited" | "excluded", navTarget?: NavigationTarget) => {
    if (!currentStore) return;
    if (status === "excluded") {
      if (!window.confirm("この店舗を対象外にしますか？（掲載はされません）")) return;
    }

    // 保存によってこの店舗がフィルター対象から外れる可能性があるため、
    // 「保存前の並び順で決まる移動先」を先に確定してから保存する
    const targetId = navTarget
      ? resolveTargetId(navTarget)
      : filteredStores[effectiveIndex + 1]?.id ?? null;
    const savedName = currentStore.name;

    setIsSaving(true);
    setSaveError(null);
    try {
      await saveSurveyResult({
        storeId: currentStore.id,
        tagIds: mergeTagIdsForSave(currentStore, selectedTagIds, allTags),
        priceRange,
        operatorReview: memo,
        surveyStatus: status,
      });
      setStores((prev) =>
        prev.map((s) =>
          s.id === currentStore.id
            ? {
                ...s,
                selectedTagIds: mergeTagIdsForSave(currentStore, selectedTagIds, allTags),
                priceRange,
                operatorReview: memo,
                surveyStatus: status,
              }
            : s
        )
      );
      clearDraft(currentStore.id);
      setPendingNav(null);
      showSavedToast(savedName);
      if (targetId) {
        setCurrentStoreId(targetId);
        setFinished(false);
        setIsModalOpen(false);
      } else {
        setFinished(true);
      }
    } catch (err) {
      // 失敗時は移動しない。次に同じ操作をやり直せるよう確認モーダルも閉じておく
      setSaveError(err instanceof Error ? err.message : "保存に失敗しました");
      setPendingNav(null);
    } finally {
      setIsSaving(false);
    }
  };

  const applyDraft = () => {
    if (!pendingDraft) return;
    setSelectedTagIds(new Set(pendingDraft.selectedTagIds));
    setPriceRange(pendingDraft.priceRange);
    setMemo(pendingDraft.memo);
    setPendingDraft(null);
  };

  const discardDraft = () => {
    if (!currentStore) return;
    clearDraft(currentStore.id);
    setPendingDraft(null);
  };

  const handleConfirmSaveAndMove = () => {
    if (!pendingNav) return;
    runSave("visited", pendingNav);
  };

  const handleDiscardAndMove = () => {
    if (!pendingNav) return;
    if (currentStore) clearDraft(currentStore.id);
    navigateTo(pendingNav);
    setPendingNav(null);
  };

  const handleCancelNav = () => setPendingNav(null);

  if (stores.length === 0) {
    return <p className="text-sm text-gray-400 p-4">対象の実店舗がありません</p>;
  }

  if (finished || !currentStore) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4 px-4 text-center">
        <p className="text-lg font-bold text-ink">対象の店舗をすべて処理しました</p>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("all");
            setFinished(false);
            setCurrentStoreId(stores[0]?.id ?? null);
          }}
          className="h-11 px-5 rounded-button bg-clay text-paper text-sm font-bold active:opacity-80"
        >
          最初の店舗に戻る
        </button>
        <Link href="/admin" className="text-xs text-gray-500 underline">
          管理画面トップへ
        </Link>
      </div>
    );
  }

  const distanceText =
    sortMode === "distance" && userLocation
      ? formatDistance(haversineMeters(userLocation, { lat: currentStore.lat, lng: currentStore.lng }))
      : null;

  return (
    <div className="flex flex-col h-[calc(100dvh-48px)] -mx-4 -mt-5 -mb-5">
      {savedToast && (
        <div className="shrink-0 bg-green-600 text-white text-sm font-medium px-4 py-2 text-center">
          保存しました ✓（{savedToast}）
        </div>
      )}
      {saveError && (
        <div className="shrink-0 bg-red-600 text-white text-sm px-4 py-2.5 flex items-start justify-between gap-3">
          <p className="flex-1">{saveError}</p>
          <button
            type="button"
            onClick={() => setSaveError(null)}
            className="shrink-0 font-bold active:opacity-70"
            aria-label="エラーを閉じる"
          >
            ✕
          </button>
        </div>
      )}

      {/* 店舗切り替えエリア */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-4 pt-3 pb-3 space-y-2">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="text-xs text-gray-500 active:opacity-70">
            ← 管理画面
          </Link>
          <span className="text-xs text-gray-500 font-medium">
            {effectiveIndex + 1} / {filteredStores.length}件
          </span>
        </div>
        <p className="text-[11px] text-gray-500">
          訪問済み {visitedCount} / {stores.length}
        </p>

        <div>
          <p className="text-xl font-bold text-ink leading-tight">{currentStore.name}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
            {currentStore.areaName}
            {distanceText && <>・{distanceText}</>}
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${SURVEY_STATUS_BADGE_CLASS[currentStore.surveyStatus]}`}
            >
              {SURVEY_STATUS_LABEL[currentStore.surveyStatus]}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => requestNavigate({ kind: "prev" })}
            disabled={effectiveIndex === 0}
            className="h-11 flex-1 rounded-button border border-gray-300 text-sm text-ink disabled:opacity-30 active:opacity-70"
          >
            保存せず前へ
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-11 px-3 rounded-button border border-gray-300 text-sm text-ink active:opacity-70 shrink-0"
          >
            店舗一覧
          </button>
          <button
            type="button"
            onClick={() => requestNavigate({ kind: "next" })}
            disabled={effectiveIndex >= filteredStores.length - 1}
            className="h-11 flex-1 rounded-button border border-gray-300 text-sm text-ink disabled:opacity-30 active:opacity-70"
          >
            保存せず次へ
          </button>
        </div>
      </div>

      {/* タグ入力エリア（スクロール） */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {pendingDraft && (
          <div className="rounded-button bg-amber-50 border border-amber-300 px-3 py-2.5 space-y-2">
            <p className="text-xs text-amber-800">
              未保存の下書きがあります（
              {new Date(pendingDraft.savedAt).toLocaleString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              時点）
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={applyDraft}
                className="h-9 px-3 rounded-button bg-clay text-paper text-xs font-medium active:opacity-80"
              >
                復元する
              </button>
              <button
                type="button"
                onClick={discardDraft}
                className="h-9 px-3 rounded-button border border-gray-300 text-xs text-ink active:opacity-70"
              >
                破棄する
              </button>
            </div>
          </div>
        )}

        <TagSection
          title="系統タグ"
          tags={byType("style")}
          selectedIds={selectedTagIds}
          onToggle={toggleTag}
        />

        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] font-medium text-gray-500 uppercase tracking-label">
              価格帯
            </h2>
            <button
              type="button"
              onClick={() => setShowPriceCriteria((v) => !v)}
              className="text-[11px] text-clay underline active:opacity-70"
            >
              {showPriceCriteria ? "基準を閉じる" : "基準を見る"}
            </button>
          </div>

          {showPriceCriteria && (
            <ul className="mb-2 rounded-button bg-gray-100 px-3 py-2 space-y-0.5">
              {PRICE_JUDGING_CRITERIA.map((line) => (
                <li key={line} className="text-[11px] text-gray-600 leading-snug">
                  {line}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-2">
            {PRICE_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriceRange(opt.value)}
                className={`min-h-[44px] px-4 rounded-button text-sm font-medium border ${
                  priceRange === opt.value
                    ? "bg-clay text-paper border-clay"
                    : "bg-white text-ink border-gray-300"
                }`}
              >
                {opt.symbol}&ensp;{opt.amountLabel}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] font-medium text-gray-500 uppercase tracking-label">
              雰囲気タグ
            </h2>
            <button
              type="button"
              onClick={() => setShowVibeGuide((v) => !v)}
              className="text-[11px] text-clay underline active:opacity-70"
            >
              {showVibeGuide ? "判定ガイドを閉じる" : "判定ガイドを見る"}
            </button>
          </div>

          {showVibeGuide && (
            <div className="mb-2 rounded-button bg-gray-100 px-3 py-2 space-y-3">
              {byType("vibe").map((tag) => {
                const guide = VIBE_GUIDE[tag.slug];
                if (!guide) return null;
                return (
                  <div key={tag.slug}>
                    <p className="text-[11px] font-semibold text-ink">{tag.label_ja}</p>
                    <p className="text-[11px] text-gray-600 leading-snug">{guide.core}</p>
                    <p className="text-[10px] text-gray-500 leading-snug">
                      観点：{guide.points.join(" / ")}
                    </p>
                  </div>
                );
              })}
              <ul className="pt-2 border-t border-gray-200 space-y-0.5">
                {VIBE_GUIDE_RULES.map((line) => (
                  <li key={line} className="text-[11px] text-gray-600 leading-snug">
                    ・{line}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {byType("vibe").map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`min-h-[44px] px-4 rounded-button text-sm font-medium border ${
                  selectedTagIds.has(tag.id)
                    ? "bg-clay text-paper border-clay"
                    : "bg-white text-ink border-gray-300"
                }`}
              >
                {tag.label_ja}
              </button>
            ))}
          </div>
        </section>
        <TagSection
          title="客層タグ"
          tags={[...byType("gender"), ...byType("age_group")]}
          selectedIds={selectedTagIds}
          onToggle={toggleTag}
        />

        <section>
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-label mb-2">
            スタッフより一言
          </label>
          <input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="店内の雰囲気、おすすめポイントなど"
            className="w-full h-11 rounded-button border border-gray-300 px-3 text-sm"
          />
        </section>
      </div>

      {/* 固定アクションバー */}
      <div className="shrink-0 bg-white border-t border-gray-200">
        <div
          className="px-4 pt-3 flex gap-2"
          style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            onClick={() => runSave("excluded")}
            disabled={isSaving}
            className="h-12 px-4 rounded-button bg-gray-200 text-gray-700 text-sm font-medium disabled:opacity-40 active:opacity-70 shrink-0"
          >
            対象外にする
          </button>
          <button
            type="button"
            onClick={() => runSave("visited")}
            disabled={isSaving}
            className="h-12 flex-1 rounded-button bg-clay text-paper text-base font-bold disabled:opacity-40 active:opacity-80"
          >
            {isSaving ? "保存中..." : "保存して次へ"}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <StoreListModal
          filteredStores={filteredStores}
          currentStoreId={currentStore.id}
          statusFilter={statusFilter}
          onStatusFilterChange={(f) => {
            setStatusFilter(f);
          }}
          sortMode={sortMode}
          userLocation={userLocation}
          onRequestLocation={requestLocation}
          geoError={geoError}
          onSelect={(storeId) => requestNavigate({ kind: "select", storeId })}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {pendingNav && (
        <NavigationConfirmModal
          isSaving={isSaving}
          onSaveAndMove={handleConfirmSaveAndMove}
          onDiscardAndMove={handleDiscardAndMove}
          onCancel={handleCancelNav}
        />
      )}
    </div>
  );
}

// このUIが編集しない商品カテゴリタグ等の既存IDを維持したまま、
// 系統・雰囲気・客層タグの選択結果を反映した「保存すべきタグID全体」を作る。
// store.selectedTagIds（DBの現在値）のうち、このUIが管轄するタグ種別
// （style/vibe/gender/age_group）のIDだけを selectedTagIds（UI状態）で
// 置き換え、それ以外（商品カテゴリ等）はそのまま保持する
function mergeTagIdsForSave(
  store: SurveyStore,
  editedIds: Set<number>,
  allTags: TagMaster[]
): number[] {
  const managedTypes = new Set(["style", "vibe", "gender", "age_group"]);
  const managedTagIds = new Set(
    allTags.filter((t) => managedTypes.has(t.type)).map((t) => t.id)
  );
  const untouched = store.selectedTagIds.filter((id) => !managedTagIds.has(id));
  return [...untouched, ...Array.from(editedIds)];
}

function TagSection({
  title,
  tags,
  selectedIds,
  onToggle,
}: {
  title: string;
  tags: TagMaster[];
  selectedIds: Set<number>;
  onToggle: (id: number) => void;
}) {
  if (tags.length === 0) return null;
  return (
    <section>
      <h2 className="text-[11px] font-medium text-gray-500 uppercase tracking-label mb-2">
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onToggle(tag.id)}
            className={`min-h-[44px] px-4 rounded-button text-sm font-medium border ${
              selectedIds.has(tag.id)
                ? "bg-clay text-paper border-clay"
                : "bg-white text-ink border-gray-300"
            }`}
          >
            {tag.label_ja}
          </button>
        ))}
      </div>
    </section>
  );
}

function NavigationConfirmModal({
  isSaving,
  onSaveAndMove,
  onDiscardAndMove,
  onCancel,
}: {
  isSaving: boolean;
  onSaveAndMove: () => void;
  onDiscardAndMove: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/40" onClick={onCancel}>
      <div
        className="mt-auto bg-paper rounded-t-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pt-4 pb-2">
          <p className="text-sm font-bold text-ink">保存されていない変更があります</p>
          <p className="text-xs text-gray-500 mt-1">移動する前にどうするか選んでください</p>
        </div>
        <div
          className="px-4 pb-4 pt-2 space-y-2"
          style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            onClick={onSaveAndMove}
            disabled={isSaving}
            className="w-full h-12 rounded-button bg-clay text-paper text-sm font-bold disabled:opacity-40 active:opacity-80"
          >
            {isSaving ? "保存中..." : "保存して移動"}
          </button>
          <button
            type="button"
            onClick={onDiscardAndMove}
            disabled={isSaving}
            className="w-full h-12 rounded-button bg-gray-200 text-gray-700 text-sm font-medium disabled:opacity-40 active:opacity-70"
          >
            破棄して移動
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full h-11 rounded-button text-gray-500 text-sm active:opacity-70"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
