import { ActionPanel, Form, Detail, List, Action, Icon, popToRoot, LocalStorage, showToast, Toast } from "@raycast/api";
import { useCallback, useState, useEffect } from "react";

function CreateCard() {
  const onSubmitForm = async (values) => {
    let cards = await LocalStorage.getItem<string>("cards") || [];
    try {
      cards = JSON.parse(cards)
    }
    catch(err) {
      console.log(err)
    }
    cards.push({...values, created_at: new Date().toLocaleString()})
    console.log('storage:')
    console.log(cards)
    await LocalStorage.setItem("cards", JSON.stringify(cards));

    await showToast({
      style: Toast.Style.Success,
      title: "Card created!"
    });
    popToRoot()
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
      />
      <Form.TextArea
        id="back"
        title="Back"
        placeholder="definition"
      />
    </Form>
  )
}

function ListCards() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    async function fetchCards(){
      let localCards = await LocalStorage.getItem<string>("cards") || [];
      try {
        localCards = JSON.parse(localCards)
      }
      catch(err) {
        console.log(err)
      }
      console.log(localCards)
      setCards(localCards)
    }
    fetchCards()
  })

  return (
    <List isShowingDetail>
      {cards.map((card) => (
        <List.Item
          title={card.front}
          detail={
            <List.Item.Detail
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label title="Front" text={card.front} />
                  <List.Item.Detail.Metadata.Label title="Back" text={card.back} />
                  <List.Item.Detail.Metadata.Label title="Created at" text={card.created_at} />
                </List.Item.Detail.Metadata>
              }
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
