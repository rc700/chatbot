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

//Menu

var dinnerMenu = {

    "Chicken and Chips - £5.00":{

        Description: "Chicken and Chips",

        Price: 5.00

    },

    "Pepperoni Pizza - £9.00":{

        Description: "Pepperoni Pizza",

        Price: 9.00

    },

    "Cheeseburger - £4.00":{

        Description: "Cheeseburger",

        Price: 4.00

    }

}

//help

bot.dialog('help', function(session){

    //send message

    session.endDialog('To talk with the bot just say Hello.')

}).triggerAction({

    matches : /^help$/,

    onSelectAction: (session,args,next) => {

        session.beginDialog(args.action,args);

    }

});

bot.dialog('order dinner', [function(session){

    //send message

    session.send('helping you order now.');

    builder.Prompts.choice(session, "Dinner Menu!",dinnerMenu);

}, function(session,results){

    console.log(results)

    if(results.response){

        var order = dinnerMenu[results.response.entity];

        var msg = "You ordered: %(Description)s for a total of £%(Price)f."

        session.dialogData.order = order;

        session.send(msg,order);

        builder.Prompts.text(session, "What is your room number?");

    }

}, function(session,results){

    var roomNum = results.response;

    var msg = "You ordered: %s for a total of £%f to Room %s.";

    session.dialogData.room = roomNum;

    session.endConversation(msg,session.dialogData.order.Description,session.dialogData.order.Price,roomNum);

}

]).triggerAction({

    matches : /^order dinner$/i,

}).endConversationAction(

    "endOrderDinner","ok. goodbye",

    {

        matches: /^cancel$|^goodbye$/i,

        confirmPrompt: "This will cancel your order, are you sure?"

    }

);

bot.dialog('dinnerReservation', [

    function(session){

        session.send('Lets get you a reservation')

        session.beginDialog('askForDateTime')

    }, 

//Save DateTime , ask for party size.

    function(session,results){

        session.dialogData.reservationDate = builder.EntityRecognizer.resolveTime([results.response]);

  

        session.beginDialog('askPartySize');

    },

//Save Party Size, ask for Reserver's name

    function(session,results){

        session.dialogData.PartySize = results.response

        session.beginDialog('resName')

    },

//Save the Reserver's name, print out.

    function(session,results){

        session.dialogData.resName = results.response

        var msg = "You made a booking for <br/>Date/Time: %s </br> Booked by: %s </br> Party of: %s people"

        session.endConversation(msg,

        session.dialogData.reservationDate.toString(),session.dialogData.resName,

        session.dialogData.PartySize)

    }

    ]).triggerAction({

        matches : /^dinner reservation$/,

    });

//Date Time

bot.dialog('askForDateTime',[

    function(session){

        builder.Prompts.time(session, "Please provide a reservation time - June 6th to Later");

    },

    function(session,results){

        session.endDialogWithResult(results)

    }

])

//Party Size

bot.dialog('askPartySize',[

    function(session){

        builder.Prompts.text(session,"How many are in the party?")

    }, 

    function(session,results){

        session.endDialogWithResult(results)

    }

])

//Reserver Name

bot.dialog('resName',[

    function(session){

        builder.Prompts.text(session,"What is the reserver's name?");

    },

    function(session,results){

        session.endDialogWithResult(results)

    }

])