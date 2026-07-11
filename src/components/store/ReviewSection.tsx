"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
};

type Props = {
  storeId: string;
  initialReviews: Review[];
  initialTotalRating: number;
  initialReviewCount: number;
  currentUserId: string | null;
  currentUserReview: Review | null;
};

const STAR_PATH =
  "M10,1 L12.1,7.1 L18.6,7.2 L13.4,11.1 L15.3,17.3 L10,13.6 L4.7,17.3 L6.6,11.1 L1.4,7.2 L7.9,7.1 Z";

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`★${rating}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" aria-hidden>
          <path
            d={STAR_PATH}
            fill={i <= rating ? "#D4714A" : "none"}
            stroke="#D4714A"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function ReviewSection({
  storeId,
  initialReviews,
  initialTotalRating,
  initialReviewCount,
  currentUserId,
  currentUserReview: initialMyReview,
}: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [totalRating, setTotalRating] = useState(initialTotalRating);
  const [reviewCount, setReviewCount] = useState(initialReviewCount);
  const [myReview, setMyReview] = useState<Review | null>(initialMyReview);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoginNotice, setShowLoginNotice] = useState(false);

  const avgRating = reviewCount > 0 ? totalRating / reviewCount : 0;

  const handleOpenReview = () => {
    if (!currentUserId) {
      setShowLoginNotice(true);
      return;
    }
    setIsModalOpen(true);
  };

  const handleSubmit = useCallback(
    async (rating: number, comment: string) => {
      const supabase = createClient();
      const { data } = await supabase
        .from("reviews")
        .upsert(
          {
            store_id: storeId,
            user_id: currentUserId!,
            rating,
            comment: comment.trim() || null,
          },
          { onConflict: "store_id,user_id" }
        )
        .select("id, rating, comment, created_at, user_id")
        .single();

      if (!data) return;

      if (myReview) {
        setTotalRating((t) => t - myReview.rating + rating);
      } else {
        setTotalRating((t) => t + rating);
        setReviewCount((c) => c + 1);
      }

      setMyReview(data);
      setReviews((prev) => {
        const without = prev.filter((r) => r.user_id !== currentUserId);
        return [data, ...without].slice(0, 5);
      });
      setIsModalOpen(false);
    },
    [storeId, currentUserId, myReview]
  );

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[11px] font-medium text-gray-500 tracking-label uppercase">
          レビュー
        </h2>
        {reviewCount > 0 && (
          <div className="flex items-center gap-1.5">
            <StarDisplay rating={Math.round(avgRating)} size={12} />
            <span className="text-xs text-gray-500">
              {avgRating.toFixed(1)}（{reviewCount}件）
            </span>
          </div>
        )}
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-2.5 mb-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-card bg-white shadow-card px-3 py-2.5"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <StarDisplay rating={review.rating} size={13} />
                  {review.user_id === currentUserId && (
                    <span className="text-[10px] text-clay font-medium bg-clay/10 px-1.5 py-0.5 rounded-full">
                      あなた
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-gray-400">
                  {formatDate(review.created_at)}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-ink leading-snug mt-1">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 mb-4">まだレビューがありません</p>
      )}

      <button
        onClick={handleOpenReview}
        className="w-full h-10 rounded-button border border-clay text-clay text-sm font-medium active:opacity-70 transition-opacity"
      >
        {myReview ? "レビューを編集する" : "レビューを書く"}
      </button>
      {showLoginNotice && (
        <p className="text-xs text-center text-gray-500 mt-2 py-1.5 bg-gray-50 rounded-xl">
          レビューを書くには<strong className="font-medium">ログイン</strong>が必要です
        </p>
      )}

      {isModalOpen && (
        <ReviewModal
          initialRating={myReview?.rating ?? 0}
          initialComment={myReview?.comment ?? ""}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}

function ReviewModal({
  initialRating,
  initialComment,
  onClose,
  onSubmit,
}: {
  initialRating: number;
  initialComment: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(rating, comment);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.4)" }}
    >
      <div className="w-full max-w-sm bg-paper rounded-t-2xl px-5 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-ink">レビューを書く</h3>
          <button
            onClick={onClose}
            className="text-sm text-gray-400 active:opacity-60"
          >
            閉じる
          </button>
        </div>

        {/* ★ セレクター */}
        <div className="flex justify-center gap-3 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onClick={() => setRating(i)}
              aria-label={`★${i}`}
              className="active:scale-90 transition-transform"
            >
              <svg width="40" height="40" viewBox="0 0 20 20" aria-hidden>
                <path
                  d={STAR_PATH}
                  fill={i <= rating ? "#D4714A" : "none"}
                  stroke="#D4714A"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
        </div>

        {/* コメント */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="コメント（任意・300字以内）"
          rows={4}
          maxLength={300}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-ink placeholder:text-gray-400 resize-none focus:outline-none focus:border-clay mb-4 bg-white"
        />

        {/* 送信ボタン */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className={`w-full h-12 rounded-button text-sm font-medium transition-colors ${
            rating > 0
              ? "bg-clay text-paper active:opacity-80"
              : "bg-gray-200 text-gray-400"
          }`}
        >
          {submitting ? "送信中…" : "送信する"}
        </button>
      </div>
    </div>
  );
}
