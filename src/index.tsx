import { ActionPanel, Form, List, Action, Icon, popToRoot, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import fs from "fs";
import os from "node:os";
import path from "node:path";
const jsonFile = `${os.homedir()}${path.sep}.flashcards.json`;

const getCards = async function() {
  let cards = []
  try {
    cards = fs.readFileSync(jsonFile)
    cards = JSON.parse(cards)
    cards.map(card => ({...card, flipped: true}))
  }
  catch(err) {
    console.log(err)
  }
  return cards
}

const setCards = async function(cards) {
  const cardsString = JSON.stringify(cards, null, 2)
  await fs.writeFile(jsonFile, cardsString, () => {})
}

function CreateCard() {
  const onSubmitForm = async (values) => {
    if(values.front.trim() == '' || values.back.trim() == '') {
      await showToast({
        style: Toast.Style.Failure,
        title: "Please all the fields"
      });
      return
    }
    let cards = await getCards()

    cards.push({...values, created_at: new Date().toLocaleString('en-GB'), id: new Date().getTime()})
    await setCards(cards)

    await showToast({
      style: Toast.Style.Success,
      title: "Card created!"
    });
    popToRoot()
  }

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
  )
}

function ListCardActions(props) {
  const deleteCard = async function(){
    let cards = await getCards()
    const newCards = cards.filter((current) => {
      return current.id != props.card.id
    })
    await setCards(newCards)
    await showToast({
      style: Toast.Style.Success,
      title: "Card deleted!"
    });
    props.onDeleted()
  }
  return (
    <Action
      title="Delete card"
      icon={Icon.Trash}
      onAction={deleteCard}
      shortcut={{ modifiers: ["cmd"], key: "d" }}
    />
  )
}

function ListCards() {
  const [cards, setCards] = useState([]);
  const [changes, setChanges] = useState(Date.now());

  const fetchCards = async function(){
    let cards = await getCards()
    let shuffledCards = cards.sort((a, b) => 0.5 - Math.random())
    setCards(shuffledCards)
  }

  useEffect(() => {
    fetchCards()
  }, [])

  const onDeleted = function(){
    fetchCards()
  }

  const display = function(card){
    if (card.flipped) {
      return "## Back\n" + card.back
    } else {
      return "## Front\n" + card.front
    }
  }

  const flipCard = function(card){
    card.flipped = !card.flipped
    setChanges(Date.now())
  }

  return (
    <List
      isShowingDetail
    >
      {cards.map((card) => (
        <List.Item
          title={card.front}
          key={card.id}
          actions={
            <ActionPanel>
              <Action
                title="Flip card"
                icon={Icon.Check}
                onAction={() => { flipCard(card) }}
              />
              <ListCardActions card={card} onDeleted={onDeleted}/>
            </ActionPanel>
          }
          detail={
            <List.Item.Detail
              markdown={display(card)}
            />
          }
        />
      ))}
    </List>
  )
}
export default function Command() {
  return (
    <List>
      <List.Item
        icon="list-icon.png"
        title="Create card"
        actions={
          <ActionPanel>
            <Action.Push
              icon={Icon.Pencil}
              title="Create card"
              target={<CreateCard/>}
            />
          </ActionPanel>
        }
      />
      <List.Item
        icon="list-icon.png"
        title="List cards"
        actions={
          <ActionPanel>
            <Action.Push
              icon={Icon.List}
              title="List cards"
              target={<ListCards/>}
            />
          </ActionPanel>
        }
      />
    </List>
  );
}
