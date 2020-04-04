import { useMagiqlQuery, useFragment } from "./graphql";

const Note = () => {
  const note = useQuery(`fragment NoteFragment on Pokemon {
  id
}
`);
  const {
    id
  } = note;
  return note;
};

function OtherNote() {
  const note = useQuery(`fragment OtherNoteFragment on PokemonAttack {
  special
}
`);
  const {
    special
  } = note;
}

const Success = () => {
  const {
    data: data,
    loading,
    error
  } = useQuery(`query success {
  pokemons_2979: pokemons(first: ${x}, second: ${8}) {
    a {
      x_f707: x(b: ${1})
    }
    attacks
    _id @hello
    drive {
      webViewLink
    }
    other
  }
}
`); // const notes = query.pokemons(`first: ${10}, second: ${8}`);

  let x = 1;
  const notes = data.pokemons_2979;
  const moreNotes = notes;
  const {
    a
  } = moreNotes;
  const c = a.x_f707;

  if (notes.length === 0) {
    return <Empty />;
  }

  return (// .filter(note =>
    //   week > 0 && note !== null ? note.week === week : true
    // )
    <Row justifyContent="space-between" flexWrap="wrap">
      {notes.map((note, index) => <Column mb="oneLine" key={note.attacks}>
          <BaseLink key={note?._id} target="_blank" rel="noreferrer" color="black" textDecoration="none" href={note.drive?.webViewLink ?? ""}>
            <BasicNoteThumbnail key={index} note={note.other} />
          </BaseLink>
        </Column>)}
    </Row>
  );
};
