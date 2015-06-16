if (Meteor.isClient) {

  Session.setDefault('notes', []);
  Session.setDefault('currentRange', {});
  Session.setDefault('currentNote', '');

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
    'keyup #add-note': function(event){
      var range = Session.get('currentRange');
      Session.set('currentNote', {
        range: range,
        text: event.target.value
      });
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
