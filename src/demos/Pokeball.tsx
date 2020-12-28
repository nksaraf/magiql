import { tw } from "twind";

export function Pokeball() {
  return (
    <div className={tw`p-4`}>
      <div className="pokeball pokeball_running">
        <div className="pokeball__button"></div>
      </div>
    </div>
  );
}
