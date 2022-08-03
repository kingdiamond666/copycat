// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
console.log('hello from the preload script')
const electron = require('electron');
const {ipcRenderer, clipboard, contextBridge} = electron;
const clipBoardListener = require('electron-clipboard-extended');
const Fuse = require('fuse.js');
let favoritesList = [];
contextBridge.exposeInMainWorld("api", {
  submitIt:(item) => {
      ipcRenderer.send('item:add', item);
  },
  listenForIt:(item) => {
    ipcRenderer.on('item:add', function(e, item){
      const ul = document.querySelector('#todo');
      const li = document.createElement('li');
      const itemText = document.createTextNode(item);
      li.appendChild(itemText);
      ul.appendChild(li);
    })
  },
  clipIt: () => {
    clipBoardListener.on('text-changed', () => {
      canListenForCopy = true;
      let text = clipBoardListener.readText();
      ipcRenderer.send('text:copied', text);
    }).startWatching()
  },
  turnOffClip: () => {
    canListenForCopy = false;
    clipBoardListener.off('text-changed');
  },
  listenForCopy:() => {
// Checks to see if item is already on clipboard and if not adds item to UI
    ipcRenderer.on('text:copied', function(e, text){
      if (textOnClipBoard.includes(text)){
        console.log('text already copied brah');
      }else{
        const ul = document.querySelector('#clipboard');
        const div = document.createElement('div');
        const li = document.createElement('li');
        const favIcon = document.createElement('span');
        const displayCopiedText = document.createElement('span');
        const copyItemText = document.createTextNode(text);
        displayCopiedText.classList.add('list-group-item');
        div.classList.add('media-body');
        displayCopiedText.appendChild(copyItemText);
        li.appendChild(displayCopiedText);
        // li.classList.add('copied-list-item','collection-item','changeit');
        li.classList.add('copied-list-item','collection-item','list-group-item');
        favIcon.classList.add('secondary-content');
        favIcon.innerHTML += '<i class="material-icons pull-right">favorite_border</i>'
        li.appendChild(favIcon);
        div.appendChild(li)
        displayCopiedText.addEventListener('click',(e) => {
          clipBoardListener.writeText(displayCopiedText.innerText);
          new Notification('Item Copied',{body: `You Just Copied \"${displayCopiedText.innerText}\"`})
        })
        favIcon.addEventListener('click', (e) => {
          ipcRenderer.send('item:add-to-db', text);
          favIcon.innerHTML = '<i class="material-icons pull-right">favorite</i>'
          new Notification('Item Added To Favorites', {body:`${text} added to favorites`})
          console.log('item submitted to database');
        })
        // canListenForCopy ? li.classList.add('changeit', 'font-engaged') : li.classList.add('changeit');
        ul.appendChild(div);
       textOnClipBoard.push(text);
      }
    })
  },
  addToFavorites: () => {
    ipcRenderer.on('item:add-to-favorites', function(e, text){

        const favorites = document.getElementById('favorites');
        const li = document.createElement('li');
        const favIcon2 = document.createElement('span');
        const displayCopiedText = document.createElement('span');
        const copyItemText = document.createTextNode(text);
        displayCopiedText.classList.add('favorite');
        displayCopiedText.appendChild(copyItemText);
        li.appendChild(displayCopiedText);
        // li.classList.add('copied-list-item','collection-item','changeit');
        li.classList.add('copied-list-item','collection-item', 'favorite-list-item' , 'list-group-item');
        favIcon2.classList.add('secondary-content');
        favIcon2.innerHTML += '<i class="material-icons pull-right">favorite</i>'
        li.appendChild(favIcon2);
        favoritesList.push(text);
        displayCopiedText.addEventListener('click',(e) => {
          clipBoardListener.writeText(displayCopiedText.innerText);
          new Notification('Item Copied',{body: `You Just Copied \"${displayCopiedText.innerText}\"`})
        })
        favIcon2.addEventListener('click', (e) => {
          ipcRenderer.send('item:delete-from-db', text);
          favIcon2.innerHTML = '<i class="material-icons">favorite_border</i>'
          console.log('delete request submitted to database');
        })
        // canListenForCopy ? li.classList.add('changeit', 'font-engaged') : li.classList.add('changeit');
        favorites.appendChild(li);
       textOnClipBoard.push(text);

    })
  },
  deleteRenderFromFavorites: () => {
    ipcRenderer.on('item:deleted', function(e, text){
      let spansToSearch = document.querySelectorAll('.favorite');
      let listItemToDelete = document.querySelectorAll('.favorite-list-item');
      let favoritesUl = document.querySelector('#favorites');
      let searchText = typeof text === 'string'? text : text.item_copied;
      let recentlyCopied = document.querySelectorAll('.regular-copied-item');
      let favoriteIcon = document.querySelectorAll('.material-icons');

      for(let i = 0; i < spansToSearch.length; i++){
        if(spansToSearch[i].textContent == searchText){
          listItemToDelete[i].parentNode.removeChild(listItemToDelete[i])

        } fart
      }
      for(let i = 0; i < recentlyCopied.length; i++){
        if(recentlyCopied[i].textContent == searchText){
          favoriteIcon[i].innerText = 'favorite_border'
        }
      }
    })
  },
  loadFavorites: () => {
     ipcRenderer.on('loadFavorites', function(e, results){
       const favorites = document.getElementById('favorites');

      results.forEach(text => {
        // console.log(text)
        const li = document.createElement('li');
        const favIcon2 = document.createElement('span');
        const displayCopiedText = document.createElement('span');
        const copyItemText = document.createTextNode(text.item_copied);
        displayCopiedText.classList.add('favorite');
        displayCopiedText.appendChild(copyItemText);
        li.appendChild(displayCopiedText);
        // li.classList.add('copied-list-item','collection-item','changeit');
        li.classList.add('copied-list-item','collection-item', 'favorite-list-item', 'list-group-item');
        favIcon2.classList.add('secondary-content');
        favIcon2.innerHTML += '<i class="material-icons pull-right">favorite</i>'
        li.appendChild(favIcon2);
        displayCopiedText.addEventListener('click',(e) => {
          clipBoardListener.writeText(displayCopiedText.innerText);
          new Notification('Item Copied',{body: `You Just Copied \"${displayCopiedText.innerText}\"`})
        })
        favIcon2.addEventListener('click', (e) => {
          ipcRenderer.send('item:delete-from-db', text);
          favIcon2.innerHTML = '<i class="material-icons pull-right">favorite_border</i>'
          console.log('delete request submitted to database');
        })
        // canListenForCopy ? li.classList.add('changeit', 'font-engaged') : li.classList.add('changeit');
        favorites.appendChild(li);
      })

    })
  },
  searchArray: () => {
    ipcRenderer.on('sendSearchableArray', function(e, favoritesArray){
      const newfavoritesArray = favoritesArray;
      favoritesList = newfavoritesArray
      console.log(newfavoritesArray)
    })
  },
  searchForItem: (text) => {
    ipcRenderer.send('item:searchedFor', text)
  },
  arraySearched: (text) => {
    ipcRenderer.on('arrayBeingSearched', function(e, text){
      const fuse = new Fuse(favoritesList)
      const options = {
        shouldSort: true,
        isCaseSensitive: false,
      }
      const result = fuse.search(text, options)
      let resultsField = document.querySelector('.resultsList')
      let listifiedResults = []
      let currentResults = []
      result.forEach(item => {
        listifiedResults.push(`<li>${item.item}</li>`)
      })
      resultsField.innerHTML = listifiedResults.join(' ');
// TODO: Take an array of the current favorites so you can compare that against your listifiedResults
// and then you can mark the class of each item that isn't in the results as "hidden" thus hiding any items
//from the list that aren't in the search results.
      const favoriteNodes = Array.from(document.querySelectorAll('.copied-list-item'));
      favoriteNodes.forEach(favorite => {
        currentResults.push(favorite.textContent)
        console.log(currentResults)
      })
      // result.forEach(item => resultsField.innerHTML = `<li>${item.item}</li>`)
      // result.forEach(item => {
      //   let resultsField = document.querySelector('.resultsList')
      //   resultsField.innerHTML =
      //   let li = document.createElement('li')
      //   let searchResult = document.createTextNode(item.item);
      //   li.appendChild(searchResult);
      //   resultsField.appendChild(li);
      //
      // })
    })
  }
})

let canListenForCopy = false;
let textOnClipBoard = []
// const {
//   contextBridge,
//   ipcRenderer
// } = require('electron');
//
// contextBridge.exposeInMainWorld(
//     "api", {
//         send: (channel, data) => {
//             // whitelist channels
//             let validChannels = ["toMain"];
//             if (validChannels.includes(channel)) {
//                 ipcRenderer.send(channel, data);
//             }
//         },
//         receive: (channel, func) => {
//             let validChannels = ["fromMain"];
//             if (validChannels.includes(channel)) {
//                 // Deliberately strip event as it includes `sender`
//                 ipcRenderer.on(channel, (event, ...args) => func(...args));
//             }
//         }
//     }
// );
