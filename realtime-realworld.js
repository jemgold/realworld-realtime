Triggers = new Meteor.Collection('triggers');

if (Meteor.isClient) {
  Meteor.Router.add({
    '/ascii': 'ascii',
    // '/piano': 'piano', // todo: make me :(
    // '/buttonpad': 'buttonpad' //todo: make me :(
    '*': 'slides'
  });

  Triggers.find({message: 'advanceSlide'}).observe({
    added: function(item) {
      if (Reveal !== undefined) {
        return Reveal.next();
      }
    }
  });

  Template.ascii.value = function() {
    return Triggers.findOne({message: 'potReading'});
  };

  Template.slides.rendered = function(){
    $("body").append('<script type="text/javascript" src="/reveal.js"></script>');
    $("body").append('<script type="text/javascript" src="/plugin/markdown/marked.js"></script>');
    $("body").append('<script type="text/javascript" src="/plugin/markdown/markdown.js"></script>');
    $("body").append('<script type="text/javascript" src="/plugin/highlight/highlight.js"></script>');

    Reveal.initialize({
      controls: false,
      progress: false,
      history: false,
      overview: false,
      center: true,
      rollingLinks: false,
      transition: 'linear', // default/cube/page/concave/zoom/linear/fade/none
      transitionSpeed: 'fast' // default/fast/slow
    });

    hljs.initHighlighting();

    Reveal.addEventListener( 'fragmentshown', function(event) {
      if ( $(event.fragment).data('action') === 'pulse') {
        Meteor.call('pulse');
      }
    }, false );
  };
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Triggers.remove({});
  });

  // Set up the board
  var Fiber = Npm.require('fibers');

  var button, led, pot, reading, potReadingId, piezo;

  var board = new five.Board({
    debug: true
  });

  board.on("ready", function() {

    button  = new five.Button(7);
    led     = new five.Led(11);
    pot     = new five.Sensor({
                pin: "A2",
                freq: 250
              });

    button.on("down", function() {
      Fiber(function() {
        console.log('Advance slide!');
        Triggers.insert({message: 'advanceSlide'});
      }).run();
    });

    pot.on('read', function(err, value) {
      reading = Math.floor( ( this.normalized / 255 ) * 100 );
      Fiber(function() {
        if (potReadingId === undefined) {
          potReadingId = Triggers.insert({message: 'potReading', value: reading});
        } else {
          Triggers.update({_id: potReadingId}, {$set: {value: reading} });
        }
      }).run();
    });
  });


  Meteor.methods({
    pulse: function() {
      if (led !== undefined) {
        var timer;
        if (timer !== undefined) {
          Meteor.clearTimer(timer);
        }
        led.pulse();
        timer = Meteor.setTimeout(function() {
          led.stop().off();
        }, 1000);
      }
    }
  });
}
