if (Meteor.isClient) {

  Session.setDefault('notes', []);

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

  function currentParagraphNotesContainer(target) {
    return $(target).parents('.paragraph-notes');
  }

  function currentParagraphNotes(id) {
    return _.filter(Session.get('notes'), function(note) {
      return note.container == id;
    });
  }

  Template.main.helpers({
    notes: function(context) {
      return currentParagraphNotes(context.hash.id);
    },
    notesCount: function(context) {
      return currentParagraphNotes(context.hash.id).length;
    },
    range: function() {
      return JSON.stringify(this.range);
    },
    currentRange: function() {
      return JSON.stringify(Session.get('currentRange'));
    },
    author: function() {
      return "Anonymous";
    }
  });

  Template.main.events({
    'click .add-note': function (event) {
      var text = currentParagraphNotesContainer(event.target).find('.note-editor').val();
      $('.note-editor').val('');
      var notes = Session.get('notes');
      var range = Session.get('currentRange');
      notes.push({range: range, container: range.container, text: text});
      Session.set('notes', notes);
      Session.set('currentRange', defaultRange);
    },
    'click .notes-counter': function(event) {
      var currentControls = currentParagraphNotesContainer(event.target).
        find('.paragraph-controls');
      var wereActive = currentControls.hasClass('active');

      $('.paragraph-controls').removeClass('active');

      if (wereActive) return;
      currentControls.addClass('active');
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
