'use strict';

// Find board name
function getBoardName() {
  var boardName = $('.board-header-btn-name').text().replace(/\s+/g, '-').toLowerCase();
  return boardName;
};

// global Variables
var repeatFlag = false;
var currentBoardName = getBoardName();

// Check dom for init
var checkDom = setInterval(function () {
  if (getBoardName() == currentBoardName) {
    if (repeatFlag == false) {
      main();
      repeatFlag = true;
    }
  } else {
    repeatFlag = false;
    currentBoardName = getBoardName();
  }
}, 500);

// main
function main() {
  // Markups
  var togglerMarkup = '<a class="list-header-extras-menu dark-hover toggle-list open-list" href="#"><span class="icon-sm icon-remove"></span></a>';
  var moveLeftMarkup = '<a class="list-header-extras-menu dark-hover move-list move-left-list" href="#"><span class="icon-sm icon-back"></span></a>';
  var moveRightMarkup = '<a class="list-header-extras-menu dark-hover move-list move-right-list" href="#"><span class="icon-sm icon-move"></span></a>';
  var headerListTogglerMarkup = '<a id="toggle-all-lists" class="board-header-btn close-all-list" href="#" title=""><span class="board-header-btn-icon icon-sm icon-remove"></span><span class="board-header-btn-text">Close all lists</span></a>';
  var listWrapperLength = $('.list-wrapper').length - 1;

  var savedOrder = [];
  var savedToggleState = [];

  // Insert to dom
  $(togglerMarkup).insertAfter('.list-header-extras-menu');
  $(moveLeftMarkup).insertAfter('.list-header-extras-menu.toggle-list');
  $(moveRightMarkup).insertAfter('.list-header-extras-menu.move-left-list');

  // Insert header list toggler to dom
  $('.board-header-btns.mod-left').append(headerListTogglerMarkup);

  // Add index and toggleState to lists
  $('.list-wrapper').each(function (i, v) {
    $(v).attr({ 'data-list-order': i, 'data-toggle-state': 'open' });
  });

  // Get lists order from local storage
  chrome.storage.local.get('listOrder', function (result) {
    var finalResult = result.listOrder;
    var closedLists = 0;
    if (finalResult != undefined) {
      finalResult.map(function (item) {
        if (item.boardName == currentBoardName) {
          savedOrder = item.listOrder;
        }
      });

      reorderLists();
    }
  });

  // Reorder lists based on saved orders
  function reorderLists() {
    var listWrapper = $('.list-wrapper');
    var wrapper = document.getElementById('board');
    for (var i = 0; i < savedOrder.length; i++) {
      wrapper.appendChild(listWrapper.get(savedOrder[i][1]));
      if (savedOrder[i][0] == 'close') {
        closeList(listWrapper.eq(savedOrder[i][1]).find('.toggle-list'));
      } else {
        openList(listWrapper.eq(savedOrder[i][1]).find('.toggle-list'));
      }
    }
    $('.list-wrapper').find('.move-left-list').show();
    $('.list-wrapper').find('.move-right-list').show();
    $('.list-wrapper').eq(0).find('.move-left-list').hide();
    $('.list-wrapper').eq(listWrapperLength - 1).find('.move-right-list').hide();
  };

  // Hide first and last arrow icons
  $('.list-wrapper').eq(0).find('.move-left-list').hide();
  $('.list-wrapper').eq(listWrapperLength - 1).find('.move-right-list').hide();

  // Move list to right index
  $('.move-list').on('click', function () {
    var listWrapperEl = $('.list-wrapper');
    var listWrapper = $(this).closest('.list-wrapper').first();
    var listWrapperIndex = listWrapper.index();
    var currentListOrder = [];
    var nextListIndex;

    if ($(this).hasClass('move-right-list')) {
      if (listWrapperIndex + 1 < listWrapperLength) {
        nextListIndex = listWrapperIndex + 1;
        listWrapper.detach();
        listWrapper.insertAfter(listWrapperEl.eq(nextListIndex));
        if (listWrapperIndex == 0) {
          listWrapper.find('.move-left-list').show();
          listWrapperEl.eq(nextListIndex).find('.move-left-list').hide();
        } else if (listWrapperIndex == listWrapperLength - 2) {
          listWrapper.find('.move-right-list').hide();
          listWrapperEl.eq(nextListIndex).find('.move-right-list').show();
        }
      }
    } else {
      if (listWrapperIndex > 0) {
        nextListIndex = listWrapperIndex - 1;
        listWrapper.detach();
        listWrapper.insertBefore(listWrapperEl.eq(nextListIndex));
        if (listWrapperIndex == 1) {
          listWrapper.find('.move-left-list').hide();
          listWrapperEl.eq(nextListIndex).find('.move-left-list').show();
        } else if (listWrapperIndex == listWrapperLength - 1) {
          listWrapper.find('.move-right-list').show();
          listWrapperEl.eq(nextListIndex).find('.move-right-list').hide();
        }
      }
    }

    // Set or modify list order
    saveListsData(currentListOrder);
  });

  // Toggle list
  $('.toggle-list').on('click', function () {
    var _this = $(this);
    var listWrapper = $(this).closest('.list-wrapper').first();
    var listTitle = listWrapper.find('.list-header-name-assist').text();
    var allListToggler = $('#close-all-lists');
    var currentListOrder = [];

    if ($(this).hasClass('open-list')) {
      closeList(_this);
      allListToggler.find('.icon-sm').addClass('icon-add').removeClass('icon-remove');
      allListToggler.find('.board-header-btn-text').text('Open all lists');
      allListToggler.addClass('open-all-list');
      allListToggler.removeClass('close-all-list');
    } else {
      openList(_this);
      allListToggler.find('.icon-sm').removeClass('icon-add').addClass('icon-remove');
      allListToggler.find('.board-header-btn-text').text('Close all lists');
      allListToggler.removeClass('open-all-list');
      allListToggler.addClass('close-all-list');
    }

    // Set or modify lists toggle state
    saveListsData(currentListOrder);
  });

  // Close all lists
  $('#toggle-all-lists').on('click', function () {
    var _this = $(this);
    var currentListOrder = [];
    if (_this.hasClass('close-all-list')) {
      _this.removeClass('close-all-list');
      _this.addClass('open-all-list');
      $('.toggle-list').each(function () {
        closeList($(this));
        _this.find('.icon-sm').addClass('icon-add').removeClass('icon-remove');
        _this.find('.board-header-btn-text').text('Open all lists');
      });
    } else {
      _this.addClass('close-all-list');
      _this.removeClass('open-all-list');
      $('.toggle-list').each(function () {
        openList($(this));
        _this.find('.icon-sm').removeClass('icon-add').addClass('icon-remove');
        _this.find('.board-header-btn-text').text('Close all lists');
      });
    }
    // Set or modify lists toggle state
    saveListsData(currentListOrder);
  });
};

function saveListsData(data) {
  // Push lists order to currentListOrder var
  $('.list-wrapper').map(function () {
    data.push([$(this).attr('data-toggle-state'), $(this).attr('data-list-order')]);
  });

  // Set or modify lists toggle state
  chrome.storage.local.get('listOrder', function (result) {
    var finalResult = result.listOrder;
    if (finalResult != undefined) {
      var currentBoard = finalResult.filter(function (item) {
        return item.boardName == currentBoardName;
      });

      if (!currentBoard.length) {
        var newData = { boardName: currentBoardName, listOrder: data };
        finalResult.push(newData);
        chrome.storage.local.set({ "listOrder": finalResult });
      } else {
        currentBoard.map(function (item) {
          item.listOrder = data;
          chrome.storage.local.set({ "listOrder": finalResult });
        });
      }
    } else {
      chrome.storage.local.set({ "listOrder": [{ boardName: currentBoardName, listOrder: data }] });
    }
  });
}

// close single list
function closeList(el) {
  var listWrapper = el.closest('.list-wrapper').first();
  var listTitle = listWrapper.find('.list-header-name-assist').text();
  el.removeClass('open-list');
  el.addClass('close-list');
  el.find('.icon-sm').removeClass('icon-remove').addClass('icon-add');
  listWrapper.css({ 'position': 'relative', 'width': 50, 'overflow': 'hidden', 'transition': '0.2s' }).attr('data-toggle-state', 'close');
  listWrapper.find('.js-list-content').prepend('<div class="close-list-overlay" style="overflow: hidden;position: absolute;z-index: 2;width: 100%;height: 100%;background: rgb(226, 228, 230);border-radius: 3px;"><span style="position: absolute;top: 57px;left: 0;right: 0;white-space: nowrap;font-weight: bold;transform: rotate(90deg);">' + listTitle + '</span></div>');
  el.css({ 'position': 'absolute', 'top': 0, 'z-index': 2, 'right': 8 });
};

// open single list
function openList(el) {
  var listWrapper = el.closest('.list-wrapper').first();
  var listTitle = listWrapper.find('.list-header-name-assist').text();
  el.addClass('open-list');
  el.removeClass('close-list');
  el.find('.icon-sm').addClass('icon-remove').removeClass('icon-add');
  listWrapper.css({ 'width': 270, 'overflow': 'auto' }).attr('data-toggle-state', 'open');
  listWrapper.find('.close-list-overlay').remove();
  el.css({ 'position': 'static', 'top': 0, 'z-index': 2, 'right': 'auto' });
};