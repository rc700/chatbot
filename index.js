// dependencies

var restify = require('restify');

var builder = require('botbuilder');

// Setup Restify Server

var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, function () {

   console.log('%s listening to %s', server.name, server.url); 

});

// Create chat connector for communicating with the Bot Framework Service

var connector = new builder.ChatConnector({

    appId: process.env.MICROSOFT_APP_ID,

    appPassword: process.env.MICROSOFT_APP_PASSWORD

});

// create the bot

var bot = new builder.UniversalBot(connector);

// Listen for messages from users 

server.post('/bot', connector.listen());

// This bot enables users to either make a dinner reservation or order dinner.

var bot = new builder.UniversalBot(connector, function(session){

    var msg = "Welcome to the reservation bot. Please say `Dinner Reservation` or `Order Dinner`";

    session.send(msg);

});

//help
bot.dialog('help', function(session){
    // Send Message
    session.endDialog('To talk with the bot just say Hello')
}).triggerAction({
    matches : /^help$/,
    onSelectAction: (session, args, next) => {
        session.beginDialog(args.action, args);
    }
});

