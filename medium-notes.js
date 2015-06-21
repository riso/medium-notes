Notes = new Mongo.Collection("notes");

Meteor.methods({
  deleteNotes: function() {
    Notes.remove({});
  }
});

if (Meteor.isClient) {

  Meteor.subscribe("notes");

  var defaultRange = {
    container: "1",
    startOffset: 0,
    endOffset: 0
  };

  Session.setDefault('currentRange', defaultRange);

  var highlightWrapper = document.createElement("span");
  highlightWrapper.className = "highlight";

  function clearHighlight() {
    var highlight = $('.highlight');
    if (!highlight.length) return;

    var par = highlight.parent();

    highlight.contents().unwrap();
    var content = '';
    par.contents().each(function(i, el){
      content += el.textContent;
    });
    par.html(content);
  }

  function highlightRange(range) {
    clearHighlight();
    var r = document.createRange();
    var node = $('#' + range.container).get(0).childNodes[0];
    r.setStart(node, range.startOffset);
    r.setEnd(node, range.endOffset);
    r.surroundContents(highlightWrapper);

    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);

    sel.collapse(node, 0);
  }

  function serializeRange(range) {
    return {
      container: range.startContainer.parentNode.id,
      startOffset: range.startOffset,
      endOffset: range.endOffset
    };
  }

  function currentParagraphContainer(target) {
    return $(target).parents('.row');
  }

  function currentParagraphNotes(id) {
    return Notes.find({container: id}).fetch();
  }

  Template.notes.helpers({
    notes: function() {
      return currentParagraphNotes(this.id);
    },
    notesCount: function() {
      return currentParagraphNotes(this.id).length;
    },
    range: function() {
      return JSON.stringify(this.range);
    },
    currentRange: function() {
      return JSON.stringify(Session.get('currentRange'));
    },
    author: function() {
      return "Anonymous";
    },
  });

  // We use jquery to capture scroll event since 
  // meteor doesn't handle it properly
  var previousScroll = 0;
  $(window).scroll(function(){
    var currentScroll = $(this).scrollTop();
    if (currentScroll > 70) {
      if (currentScroll > previousScroll) {
        $('#header').addClass('asleep');
      } else {
        $('#header').removeClass('asleep');
      }
    } else {
      $('#header').removeClass('asleep');
    }
    previousScroll = currentScroll;
  });
  Template.main.events({
    'click .add-note, keypress .note-editor': function (event) {
      if (event.type == "keypress" && event.which != 13) return;
      var text = currentParagraphContainer(event.target).find('.note-editor').val();
      $('.note-editor').val('');
      var range = Session.get('currentRange');
      Notes.insert({range: range, container: range.container, text: text});
      Session.set('currentRange', defaultRange);
      return false;
    },
    'click #clear-notes': function() {
      Meteor.call('deleteNotes');
    },
    'click .notes-counter': function(event) {
      var currentControls = currentParagraphContainer(event.target).
        find('.paragraph-controls');
      var containerId = currentParagraphContainer(event.target).find('p').attr('id');
      var wasActive = currentControls.hasClass('active');

      $('.paragraph-controls').removeClass('active');
      $('.notes-counter').removeClass('focus');
      var range = Session.get('currentRange');
      range.container = containerId;
      Session.set('currentRange', range);

      if (wasActive) return;
      currentControls.addClass('active');
      currentParagraphContainer(event.target).find('.notes-counter').addClass('focus');

    },
    'mousedown p': clearHighlight,
    'mouseup p': function(event) {
      var selection = window.getSelection();
      if (!selection) return;

      var range = serializeRange(selection.getRangeAt(0));
      Session.set('currentRange', range);

      $('.paragraph-controls').removeClass('active');
      var currentParagraph = $(event.target).parent();
      currentParagraph.find('.paragraph-controls').addClass('active');
      currentParagraph.find('.note-editor').focus();
    },
    'mouseenter .note-text': function() {
      highlightRange(this.range);
    },
    'focus .note-editor': function(event) {
      highlightRange(Session.get('currentRange'));
    },
    'mouseleave .note-text': clearHighlight
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
