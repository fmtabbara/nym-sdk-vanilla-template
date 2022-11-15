import { createNymMixnetClient } from '@nymproject/sdk'

const VALIDATOR_API_URL = 'https://qwerty-validator-api.qa.nymte.ch/api'

const recipient = document.querySelector('#recipient') as HTMLInputElement
const sendButton = document.querySelector('#send') as HTMLButtonElement
const sendToSelf = document.querySelector('#send-to-self') as HTMLButtonElement
const input = document.querySelector('#input') as HTMLInputElement
const myAddress = document.querySelector('#self-address')
const messages = document.querySelector('#messages')
const statusChip = document.querySelector('#status-chip')

const createMessageElement = (message: string) => {
  const li = document.createElement('li') as HTMLLIElement
  li.innerText = message
  return li
}

const main = async () => {
  // create the nym client
  const nym = await createNymMixnetClient()

  nym.events.subscribeToConnected((e) => {
    if (myAddress && e.args.address) {
      myAddress.textContent = e.args.address
    }
    if (statusChip) {
      statusChip.classList.remove('show')
      setTimeout(() => {
        statusChip.classList.add('show', 'connected')
        statusChip.innerHTML = e.kind
      }, 500)
    }
  })

  // show message payload content when received
  nym.events.subscribeToTextMessageReceivedEvent((e) => {
    const newMessage = createMessageElement(e.args.payload)
    messages?.append(newMessage)
  })

  // start the client and connect to a gateway
  try {
    await nym.client.start({
      clientId: '',
      validatorApiUrl: VALIDATOR_API_URL,
    })
  } catch (e) {
    console.log(e)
  }

  // handle button click to send message
  async function handleClick(payload: string, recipient: string) {
    await nym.client.sendMessage({ payload, recipient })
    clearInput()
  }

  function clearInput() {
    if (input) {
      input.value = ''
    }
  }

  if (sendButton) {
    sendButton.onclick = async () => {
      if (recipient.value && input?.value) {
        handleClick(input.value, recipient.value)
      }
    }
  }

  if (sendToSelf && recipient && myAddress) {
    sendToSelf.onclick = () => {
      recipient.value = myAddress.innerHTML
    }
  }
}

main()
