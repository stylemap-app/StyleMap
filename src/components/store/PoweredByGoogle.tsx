// Google Maps Platform利用規約: 地図ウィジェットを表示していない画面で
// Placesデータを表示する場合の帰属表示。地図（MapView）自体はウィジェットが
// 自前で表示するため、ここでは地図を伴わない画面（詳細/一覧/お気に入り）でのみ使用する
export default function PoweredByGoogle() {
  return (
    <p className="text-[11px] text-gray-600 text-center py-3">
      Powered by Google
    </p>
  );
}
