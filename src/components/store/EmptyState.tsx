type Props = {
  totalCount: number;
  onShowAll: () => void;
  onReset: () => void;
};

export default function EmptyState({ totalCount, onShowAll, onReset }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-6">
      <div className="space-y-2">
        <p className="text-[15px] font-medium text-ink">
          条件に合う店舗が見つかりませんでした
        </p>
        <p className="text-xs text-gray-500">
          スタイルやこだわりの組み合わせを変えてみてください
        </p>
      </div>
      <div className="w-full space-y-2.5">
        <button
          onClick={onShowAll}
          className="w-full h-11 rounded-button bg-clay text-paper text-sm font-medium active:opacity-80"
        >
          マッチ度順で全{totalCount}件表示
        </button>
        <button
          onClick={onReset}
          className="w-full h-11 rounded-button border border-gray-300 text-ink text-sm active:opacity-80"
        >
          フィルターをリセット
        </button>
      </div>
    </div>
  );
}
