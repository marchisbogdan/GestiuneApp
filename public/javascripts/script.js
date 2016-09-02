// data for the clusterize functionalities
let data = [];
// adding clusterize.js functionalities for data display
let clusterize = new Clusterize({
  rows: data,
  scrollId: 'scrollArea',
  contentId: 'contentArea',
  rows_in_block: 50,
  blocks_in_cluster: 2,
});

/**
  IIFE used to add the event listeners to the proper HTML tags
*/
(() => {

  // let file = document.getElementById('file-input');
  // file.addEventListener('change', () => {
  //   openFile(event);
  // });
  let searcher = document.getElementById('search-bar');
  searcher.addEventListener('keyup', () => {
    searchFor(event);
  })
  let sorter = document.getElementById('sort-button');
  sorter.addEventListener('click', sortResults);

  let createButton = document.getElementById('create-button');
  createButton.addEventListener('click', addCategory);

  // called when the list item <a> tag is clicked
  // (for delete list item purposes)
  $('ul').on('click', 'li a', function() {
    let $this = $(this);
    let $input = $this[0];
    let $li = $this.parent();
    deleteCategory($li);
  });

  // called when the list item span is edited
  $('ul').on('keydown', 'li span', function(event) {
    let $this = $(this);
    let $span = $this[0];
    if (lastText === "") {
      spanText = $this[0].innerText;
      lastText = spanText.toString();
    }
    let $li = $this.parent();
    //let id = $li.attr('id');
    let key = event.keyCode;
    let target = event.target;
    let text = $span.innerHTML;
    $this.addClass('editing');
    if (key === 27) { //escape key
      $this.removeClass('editing');
      document.execCommand('undo');
      target.blur();
    } else if (key === 13) { //enter key
      console.log("text:" + text);
      if (text === "") {
        $this.removeClass('editing');
        document.execCommand('undo');
        target.blur();
      } else {
        $this.removeClass("editing");
        event.target.blur();
        updateCategory(text);
        event.preventDefault();
      }
    }
  });

  // a function call for getting the data from server
  getInformationFromServer();
})();

// Global Variables

let allContent = "";
// contains all the content of the input file
let arr = [];
// contains all the values for the arr Array as key and the number of
// appearances as value.
let map = new Map();
// an array with the results of the last content matching search.
let lastResults = [];
// a variable that specifies the way in which an array is sorted.
// 1 - ascending
// 0 - descending
let direction = 1;
// a variable with the last text content from an editable span
let lastText = "";
// a counter variable to repesent the id of a list item in a list
let idLi = 1;

/**

*/
function getInformationFromServer() {
  console.log("STARTING....");
  $.ajax({
      url: '/api/gest',
      type: 'GET',
      dataType: 'json',
    })
    .done(function(data) {
      //let i = 0;
      //let len = data.length;
      //let progressBar = document.getElementsByClassName('progress-bar')[0];
      console.log("DATA length:" + data.length)
      for (let obj of data) {
        //i++;
        //progressBarUpdate(len, i, progressBar);
        if (obj.text) {
          arr.push(obj.text);
        } else {
          console.log(obj + " has no text field! text:" + obj.text);
        }
      }

      serverContentLoaded();

      console.log(arr.length + " elements added to arr!");
      addToMap(arr)
        .then((value) => {
          let mess = document.getElementsByClassName("clusterize-no-data")[0]
          mess.innerHTML = "Data Loaded. Please give an input...";
          console.log(value + " unique elements added!");
        })
        .catch((error) => {
          console.log("Input Error:" + error);
        })
    })
    .fail(function() {
      console.log("Couldn't load the data from server!!!");
    });
}

/**
  Progress bar progress updater
*/
function progressBarUpdate(len, i, p) {
  let procent = Math.round((i / len) * 100);
  p.style.width = procent + "%";
  p.innerHTML = procent + "%";
}

/**
  A function which is called when the data from the server is loaded
*/
function serverContentLoaded() {
  $('.loader').hide();
}
/**
  The function adds a new category to the global array and map.
*/
function addCategory() {
  let categoryInput = document.getElementById('content-input');
  let value = categoryInput.value.toString();
  $.ajax({
      url: '/api/gest',
      type: 'POST',
      data: {
        text: value
      },
      dataType: 'json',
    })
    .done(function(data) {
      let category = data.category;
      arr.push(category);
      // insert the value in the Map
      let newArr = [];
      newArr.push(value);
      addToMap(newArr)
        .then((value) => {
          console.log("Element added!");
        })
        .catch((error) => {
          console.log("Input Error:" + error);
        });

    })
    .fail(function() {
      console.log("Couldn't add the data to the DB!!!");
    });
}

/**
  The function is called when the content of a list item is modified.
  @event - the event that triggered the function
*/
function updateCategory(text) {
  let newArr = [];
  $.ajax({
      url: '/api/gest/' + lastText,
      type: 'PUT',
      data: {
        text: text
      },
      dataType: 'json'
    })
    .done(function(data) {
      newArr.push(text);
      addToMap(newArr)
        .then((value) => {
          console.log("Element updated!");
        })
        .catch((error) => {
          console.log("Input Error:" + error);
        });

      removeLiFromDataStructures(lastText);
      lastText = "";
    })
    .fail(function() {
      console.log("ERROR in UPDATE!");
    });
}

/**
  The function is triggered when a list item has to be deleted
*/
function deleteCategory($li) {
  let text = $li.children()[0].innerText;
  $.ajax({
      url: '/api/gest/' + text,
      type: 'DELETE',
      data: {
        text: text
      },
      dataType: 'json'
    })
    .done(function(data) {
      removeLiFromDataStructures(text);
      $li.remove();
    })
    .fail(function() {
      console.log("ERROR in DELETE!");
    });
}

/**
  The function removes or updates the given input from the Map
  @text - String - the element to be updated
*/
function removeLiFromDataStructures(text) {
  console.log(text + " count:" + map.get(text));
  let val = map.get(text) - 1;
  if (val === 0) {
    map.delete(text);
    // remove from the lastResults
    let index = lastResults.indexOf(text);
    console.log(index);
    if (index > -1) {
      lastResults.splice(index, 1);
      console.log("element deleted form index:" + index);
    }
  } else {
    map.set(text, val);
  }
  console.log(text + " count:" + map.get(text));
}

/**
  The function is triggered when a file is loaded to the page, and
  is used to read the contet and store it in a Map.
  @event - the event containing formal argument
*/
function openFile(event) {
  let input = event.target;

  let reader = new FileReader();
  reader.onload = function() {
    let text = reader.result;
    let node = document.getElementById('output');
    allContent = text;
    arr = allContent.split("\n");
    //lastResults.push(...arr);
    addToMap(arr)
      .then((value) => {
        console.log(value + " unique elements added!");
      })
      .catch((error) => {
        console.log("Input Error:" + error);
      })
  }
  reader.readAsText(input.files[0]);
  document.getElementsByClassName("info")[0].innerHTML = "Now give an imput for processing.";
}

/**
  The function is called when the sort-button is pushed, and is used for
  sorting the result of the last pattern matching search.
*/
function sortResults() {
  let len = lastResults.length;
  if (len) {
    let target = document.getElementsByClassName('list')[0];
    sortingArray(lastResults)
      .then((result) => {
        clusterize.clear();
        target.innerHTML = result;
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

/**
  Function used for sorting an array with the results of the last filtering.
  @arr - Array of Strings
  @return - a Promise
*/
function sortingArray(arr) {
  return new Promise((resolve, reject) => {
    let result = "";
    let len = arr.length;

    arr.sort(function(a, b) {
      let la = a.toLowerCase();
      let lb = b.toLowerCase();
      if (la < lb) {
        return -1;
      }
      if (la > lb) {
        return 1;
      }
      return 0;
    });

    if (direction) {
      direction = 0;
    } else {
      arr.reverse();
      direction = 1;
    }

    for (let i = 0; i < len; i++) {
      result += `<li class="list-group-item">${i+1}. ${arr[i]}
      <span class="goRight">count:${map.get(arr[i])}</span></li>`;
    }

    if (result.length) {
      resolve(result);
    } else {
      reject(new Error("There are no elements in the sorted Array!"));
    }
  })
}

/**
  Function used matching the given pattern to all the mapped strings.
  @event - the event containing formal argument
*/
function searchFor(event) {
  let input = event.target.value;
  console.log(input);
  let target = document.getElementsByClassName('list')[0];
  // 16 - shift
  matchThePattern(input)
    .then((value) => {
      return addResultsToDOM(value);
    })
    .then((value) => {
      console.log("Added values to DOM!");
    })
    .catch((error) => {
      target.innerHTML = "No results...";
      console.log(error);
    });
}

/**
  The function searches a Map for similarities between its keys and the given
  string

  @substring - String - the pattern to match
  @return - a Promise
*/
function matchThePattern(substring) {
  return new Promise(function(resolve, reject) {
    let results = [];
    for (let key of map.keys()) {
      if (key.includes(substring) || substring === "") {
        results.push(key);
      }
    }
    if (results.length) {
      resolve(results);
    } else {
      lastResults = [];
      reject(new Error("No elements match the pattern!"));
    }
  });
}

/**
  The function add the result of an given array as list items to the DOM.

  @arr - Array given for processing
  @return - a Promise
*/
function addResultsToDOM(arr) {
  return new Promise(function(resolve, reject) {
    let len = arr.length;
    let target = document.getElementsByClassName('list')[0];
    let result = "";
    let uniqueElement = "";
    target.innerHTML = "";
    let start, end;
    start = performance.now();
    liId = 1;
    data = [];
    clusterize.clear();
    for (let i = 0; i < len; i++) {
      let elemCount = map.get(arr[i]);
      for (let j = 1; j <= elemCount; j++) {
        result += `<li id="${liId}" class="list-group-item">
        <span class="item-text" contenteditable="true">${arr[i]}</span>
        <a class="pull-right">
        <small><i class="glyphicon glyphicon-trash"></i></small>
        </a>
        </li>`;
        liId += 1;
        data.push(result);
        result = "";
      }
      console.log(arr[i] + " added " + map.get(arr[i]) + " times");
    }
    end = performance.now();
    console.log("TOTAL TIME (ms):" + (end - start));
    lastResults = [];
    lastResults.push(...arr);

    clusterize.append(data);
    if (lastResults.length) {
      resolve(lastResults.length);
    } else {
      reject(new Error("No elements match the pattern!"));
    }
  });
}

/**
  The function adds all the alements of a given array to a Map structure which
  holds the content as keys and the number of appearances as values

  @arr - Array with Strings
  @return - a Promise
*/
function addToMap(ar) {
  return new Promise(function(resolve, reject) {
    let len = ar.length;
    for (let i = 0; i < len; i++) {
      let string = ar[i].trim();
      if (map.has(string)) {
        let value = map.get(string) + 1;
        map.set(string, value);
      } else {
        map.set(string, 1);
        lastResults.push(string);
      }
    }
    if (map.size) {
      resolve(map.size);
    } else {
      reject(new Error("There are no elements in the map!"));
    }
  });
}
