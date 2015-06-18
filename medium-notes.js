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
    }
  });

  Template.main.events({
    'click #add-node': function () {
      var text = $('#note-editor').val();
      $('#note-editor').val('');
      var notes = Session.get('notes');
      notes.push({range: Session.get('currentRange'), text: text});
      Session.set('notes', notes);
      Session.set('currentRange', defaultRange);
    },
    'click .note': function(event) {
      $('.paragraph-controls').toggleClass('active');
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
    'mouseenter .note-text': function() {
      var r = this.range;
      var range = document.createRange();
      var node = $('#' + r.container).get(0).childNodes[0];
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

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
