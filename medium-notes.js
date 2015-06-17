if (Meteor.isClient) {

  Session.setDefault('notes', []);
  Session.setDefault('currentRange', {});
  Session.setDefault('currentNote', '');

  var highlightWrapper = document.createElement("span");
  highlightWrapper.className = "highlight";

  Template.main.helpers({
    notes: function() {
      return Session.get('notes');
    },
    notesCount: function() {
      return Session.get('notes').length;
    },
    range: function() {
      return JSON.stringify(this.range);
    },
    currentRange: function() {
      return JSON.stringify(Session.get('currentRange'));
    },
    currentNote: function() {
      return Session.get('currentNote');
    }
  });

  Template.main.events({
    'click button': function () {
      var notes = Session.get('notes');
      var currentNote = Session.get('currentNote');
      notes.push(currentNote);
      Session.set('notes', notes);
    },
    'click .note': function(event) {
      $('.paragraph-controls').removeClass('hidden');
      $('.notes-list').removeClass('hidden');
    },
    'mouseup p': function() {
      var selection = window.getSelection();
      if (!selection) return;
      var range = selection.getRangeAt(0);
      Session.set('currentRange', {
        container: range.startContainer.parentNode.id,
        startOffset: range.startOffset,
        endOffset: range.endOffset
      });
    },
    'keyup #add-note': function(event) {
      var range = Session.get('currentRange');
      Session.set('currentNote', {
        range: range,
        text: event.target.value
      });
    },
    'mouseenter .note-text': function() {
      var r = this.range;
      var range = document.createRange();
      var node = $('#' + r.container)[0].childNodes[0];
      range.setStart(node, r.startOffset);
      range.setEnd(node, r.endOffset);
      range.surroundContents(highlightWrapper);

      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);

      sel.collapse(node, 0);
    },
    'mouseleave .note-text': function() {
      $('.highlight').contents().unwrap();
      
      var par = $('#' + this.range.container);
      var content = '';
      par.contents().each(function(i, el){
        content += el.textContent;
      });
      par.html(content);
    }
  });

  Template.main.rendered = function() {
    var defaultRange = document.createRange();
    defaultRange.selectNodeContents(document.getElementsByTagName('p')[0]);

    Session.set('currentRange', {
      container: defaultRange.startContainer.id,
      startOffset: defaultRange.startOffset,
      endOffset: defaultRange.endOffset
    });
  };
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
