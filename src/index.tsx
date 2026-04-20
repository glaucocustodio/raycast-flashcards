import { ActionPanel, Form, List, Action, Icon, popToRoot, useNavigation, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import fs from "fs";
import os from "node:os";
import path from "node:path";

interface Card {
  id: number;
  front: string;
  back: string;
  created_at: string;
  flipped?: boolean;
}

const jsonFile = `${os.homedir()}${path.sep}.flashcards.json`;

const getCards = async function (): Promise<Card[]> {
  let cards: Card[] = [];
  try {
    const raw = fs.readFileSync(jsonFile, "utf-8");
    cards = JSON.parse(raw);
  } catch (err) {
    console.log(err);
  }
  return cards;
};

const setCards = async function (cards: Card[]) {
  const cardsString = JSON.stringify(cards, null, 2);
  fs.writeFileSync(jsonFile, cardsString);
};

function CreateCard() {
  const { push } = useNavigation();

  const onSubmitForm = async (values: { front: string; back: string }) => {
    if (values.front.trim() == "" || values.back.trim() == "") {
      await showToast({
        style: Toast.Style.Failure,
        title: "Please fill in all the fields",
      });
      return;
    }
    const cards = await getCards();

    cards.push({ ...values, created_at: new Date().toLocaleString("en-GB"), id: new Date().getTime() });
    await setCards(cards);

    await showToast({
      style: Toast.Style.Success,
      title: "Card created!",
    });
    push(<ListCards />);
  };

  const [frontError, setFrontError] = useState<string | undefined>();
  const [backError, setBackError] = useState<string | undefined>();

  function dropFrontErrorIfNeeded() {
    if (frontError && frontError.length > 0) {
      setFrontError(undefined);
    }
  }
  function dropBackErrorIfNeeded() {
    if (backError && backError.length > 0) {
      setBackError(undefined);
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit" onSubmit={onSubmitForm} />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="front"
        title="Front"
        placeholder="term"
        error={frontError}
        onChange={dropFrontErrorIfNeeded}
        onBlur={(event) => {
          if (event.target.value?.length == 0) {
            setFrontError("The field should't be empty!");
          } else {
            dropFrontErrorIfNeeded();
          }
        }}
      />
      <Form.TextArea
        id="back"
        title="Back"
        placeholder="definition"
        error={backError}
        onChange={dropBackErrorIfNeeded}
        onBlur={(event) => {
          if (event.target.value?.length == 0) {
            setBackError("The field should't be empty!");
          } else {
            dropBackErrorIfNeeded();
          }
        }}
      />
    </Form>
  );
}

function EditCard(props: { card: Card; onEdited: () => void }) {
  const { card } = props;
  const { pop } = useNavigation();

  const onSubmitForm = async (values: { front: string; back: string }) => {
    if (values.front.trim() == "" || values.back.trim() == "") {
      await showToast({
        style: Toast.Style.Failure,
        title: "Please fill in all the fields",
      });
      return;
    }
    const cards = await getCards();
    const updated = cards.map((c) => (c.id === card.id ? { ...c, front: values.front, back: values.back } : c));
    await setCards(updated);
    await showToast({
      style: Toast.Style.Success,
      title: "Card updated!",
    });
    props.onEdited();
    pop();
  };

  const [frontError, setFrontError] = useState<string | undefined>();
  const [backError, setBackError] = useState<string | undefined>();

  function dropFrontErrorIfNeeded() {
    if (frontError && frontError.length > 0) setFrontError(undefined);
  }
  function dropBackErrorIfNeeded() {
    if (backError && backError.length > 0) setBackError(undefined);
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save" onSubmit={onSubmitForm} />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="front"
        title="Front"
        defaultValue={card.front}
        error={frontError}
        onChange={dropFrontErrorIfNeeded}
        onBlur={(event) => {
          if (event.target.value?.length == 0) {
            setFrontError("The field should't be empty!");
          } else {
            dropFrontErrorIfNeeded();
          }
        }}
      />
      <Form.TextArea
        id="back"
        title="Back"
        defaultValue={card.back}
        error={backError}
        onChange={dropBackErrorIfNeeded}
        onBlur={(event) => {
          if (event.target.value?.length == 0) {
            setBackError("The field should't be empty!");
          } else {
            dropBackErrorIfNeeded();
          }
        }}
      />
    </Form>
  );
}

function ListCardActions(props: { card: Card; onDeleted: () => void; onEdited: () => void }) {
  const deleteCard = async function () {
    const cards = await getCards();
    const newCards = cards.filter((current) => {
      return current.id != props.card.id;
    });
    await setCards(newCards);
    await showToast({
      style: Toast.Style.Success,
      title: "Card deleted!",
    });
    props.onDeleted();
  };
  return (
    <>
      <Action.Push
        title="Edit card"
        icon={Icon.Pencil}
        target={<EditCard card={props.card} onEdited={props.onEdited} />}
        shortcut={{ modifiers: ["cmd"], key: "e" }}
      />
      <Action title="Delete card" icon={Icon.Trash} onAction={deleteCard} shortcut={{ modifiers: ["cmd"], key: "d" }} />
    </>
  );
}

function ListCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const fetchCards = async function () {
    const cards = await getCards();
    const shuffledCards = cards.sort(() => 0.5 - Math.random());
    setCards(shuffledCards);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const onDeleted = function () {
    fetchCards();
  };

  const onEdited = function () {
    fetchCards();
  };

  const display = function (card: Card) {
    if (card.flipped) {
      return "## Back\n" + card.back;
    } else {
      return "## Front\n" + card.front;
    }
  };

  const flipCard = function (card: Card) {
    card.flipped = !card.flipped;
    setCards([...cards]);
  };

  return (
    <List isShowingDetail>
      {cards.map((card) => (
        <List.Item
          title={card.front}
          key={card.id}
          actions={
            <ActionPanel>
              <Action
                title="Flip card"
                icon={Icon.Check}
                onAction={() => {
                  flipCard(card);
                }}
              />
              <ListCardActions card={card} onDeleted={onDeleted} onEdited={onEdited} />
            </ActionPanel>
          }
          detail={<List.Item.Detail markdown={display(card)} />}
        />
      ))}
    </List>
  );
}
export default function Command() {
  return (
    <List>
      <List.Item
        icon="list-icon.png"
        title="Create card"
        actions={
          <ActionPanel>
            <Action.Push icon={Icon.Pencil} title="Create card" target={<CreateCard />} />
          </ActionPanel>
        }
      />
      <List.Item
        icon="list-icon.png"
        title="List cards"
        actions={
          <ActionPanel>
            <Action.Push icon={Icon.List} title="List cards" target={<ListCards />} />
          </ActionPanel>
        }
      />
    </List>
  );
}
