import { useMagiqlQuery, useFragment } from "./graphql";

const Note = () => {
  const note = useFragment("Pokemon");
  const { id } = note;
  return note;
};

function OtherNote() {
  const note = useFragment("PokemonAttack");
  const { special } = note;
}

const Success = () => {
  const { query, loading, error } = useMagiqlQuery("success");
  // const notes = query.pokemons(`first: ${10}, second: ${8}`);
  let x = 1;
  const notes = query.pokemons({ first: x, second: 8 });
  const moreNotes = notes;

  const { a } = moreNotes;
  const c = a.x({
    b: 1
  });

  if (notes.length === 0) {
    return <Empty />;
  }

  return (
    // .filter(note =>
    //   week > 0 && note !== null ? note.week === week : true
    // )
    <Row justifyContent="space-between" flexWrap="wrap">
      {notes.map((note, index) => (
        <Column mb="oneLine" key={note.attacks as string}>
          <BaseLink
            key={note?._id("@hello") as string}
            target="_blank"
            rel="noreferrer"
            color="black"
            textDecoration="none"
            href={note.drive?.webViewLink ?? ""}
          >
            <BasicNoteThumbnail key={index} note={note.other(Note.Fragment)} />
          </BaseLink>
        </Column>
      ))}
    </Row>
  );
};
