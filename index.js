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


var dinnerMenu = {
    "Soup - £6.00": {
        Description: "Soup",
        Price: 6.00
    },
    "Steak and Chips - £17.99": {
        Description: "Steak and Chips",
        Price: 17.99
    },
    "Chocolate Fudge Cake - £4.29": {
        Description: "Chocolate Fudge Cake",
        Price: 4.29
    }
};

// order dinner
bot.dialog('order_dinner', [ 
    function(session){
    // Send Message
    session.send("Let's order some dinner!");
    builder.Prompts.choice(session, "Choose from the following options from our menu", dinnerMenu)
    },
    function(session, results){
        if(results.response){
            var order = dinnerMenu[results.response.entity];
            var msg = "You ordered: %(Description)s for a total of $%(Price)f."
            session.dialogData.order = order;
            session.send(msg, order)

            builder.Prompts.text(session, "What is your room number?")
            
        }
    }

]).triggerAction({
    matches : /^order dinner$/i,
    onSelectAction: (session, args, next) => {
        session.beginDialog(args.action, args);
    }
});

// book reservation
bot.dialog('dinner_reservation', function(session){
    // Send Message
    session.send('When would you like to come for dinner?');
}).triggerAction({
    matches : /^make reservation$/i,
    onSelectAction: (session, args, next) => {
        session.beginDialog(args.action, args);
    }
});

// help
bot.dialog('help', function(session){
    // Send Message
    session.endDialog('To order dinner say order dinner, to make a reservation say make reservation')
}).triggerAction({
    matches : /^help$/,
    onSelectAction: (session, args, next) => {
        session.beginDialog(args.action, args);
    }
});
