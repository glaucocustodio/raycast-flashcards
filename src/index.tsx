import { ActionPanel, Form, Detail, List, Action, Icon, popToRoot, LocalStorage, showToast, Toast } from "@raycast/api";
import { useCallback, useState, useEffect } from "react";

const getCards = async function() {
  let cards = await LocalStorage.getItem<string>("cards") || [];
  try {
    cards = JSON.parse(cards)
  }
  catch(err) {
    console.log(err)
  }
  return cards
}

const setCards = async function(cards) {
  return await LocalStorage.setItem("cards", JSON.stringify(cards));
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

    cards.push({...values, created_at: new Date().toLocaleString(), id: new Date().getTime()})
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
    />
  )
}

function ListCards() {
  const [cards, setCards] = useState([]);

  const fetchCards = async function(){
    let cards = await getCards()
    setCards(cards)
  }

  useEffect(() => {
    fetchCards()
  }, [])

  const onDeleted = function(){
    fetchCards()
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
              <ListCardActions card={card} onDeleted={onDeleted}/>
            </ActionPanel>
          }
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
