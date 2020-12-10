import ow from "oceanwind";

export function Pokeball() {
  return (
    <div className={ow`p-4`}>
      <div className="pokeball pokeball_running">
        <div className="pokeball__button"></div>
      </div>
    </div>
  );
}
