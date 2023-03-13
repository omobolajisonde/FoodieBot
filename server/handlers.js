const Menu = require("./models/menuModel");

const { saveToSession, emitBotResponseEvent } = require("./helpers");

exports.handleChatSave =
  (Chat, user) =>
  async ({ message, isBotMsg }) => {
    await Chat.create({
      message,
      isBotMsg,
      userId: user._id,
    });
  };

exports.handleOptionSent = (socket, session, user, User) => async (option) => {
  // GET resources
  const menu = await Menu.find({}).hint({ id: 1 });

  // regular expression to include the range of numbers from 2 to 25 (both inclusive)
  const pattern = /^([2-9]|1\d|2[0-5])(,([2-9]|1\d|2[0-5]))*$/;

  switch (true) {
    case option === "1":
      emitBotResponseEvent(socket, "menu", { menu });
      session.menuDisplayed = true;
      saveToSession(session);
      break;

    case option === "99":
      if (session.currentOrder) {
        session.orderNo = session.orderNo ? session.orderNo + 1 : 1;
        saveToSession(session);

        const orders = {
          orderNo: session.orderNo,
          order: session.currentOrder.order.map((order) => order._id),
          total: session.currentOrder.total,
        };
        await user.updateOne({
          $push: { orders },
        }); // updating the current user orders
        emitBotResponseEvent(socket, "checkout", {
          text: "Fantastic! Thank you for placing your order with us.",
        });
        // Reset currentOrder and menuDisplayed after checkout
        session.currentOrder = undefined;
        session.menuDisplayed = undefined;
        saveToSession(session);
      } else {
        emitBotResponseEvent(socket, "", {
          text: "I'm sorry, but it looks like you don't have any active orders to checkout. If you'd like to place an order, please select option 1 to see our menu.",
        });
      }
      break;

    case option === "98":
      const knownUser = await User.findOne({ userId: session.userId }).populate(
        "orders.order"
      ); // finds user and populates their orders
      if (knownUser.orders.length) {
        emitBotResponseEvent(socket, "orderHistory", {
          orders: knownUser.orders,
        });
      } else {
        emitBotResponseEvent(socket, "", {
          text: "It looks like you haven't placed an order with us yet. To get started, please select option 1 to view our menu and place your first order. We're excited to serve you!.",
        });
      }
      break;

    case option === "97":
      if (session.currentOrder) {
        emitBotResponseEvent(socket, "currentOrder", {
          order: session.currentOrder,
          orderNo: session.orderNo ? session.orderNo + 1 : 1,
        });
      } else {
        emitBotResponseEvent(socket, "", {
          text: "I'm sorry, but it looks like you don't have any active order. If you'd like to place a new order, please select option 1 to see our menu.",
        });
      }
      break;

    case option === "0":
      if (session.currentOrder) {
        session.currentOrder = undefined;
        saveToSession(session);
        emitBotResponseEvent(socket, "", {
          text: "Order cancelled! If you'd like to place a new order, please select option 1 to see our menu.",
        });
      } else {
        emitBotResponseEvent(socket, "", {
          text: "I'm sorry, but it looks like you don't have any active orders to cancel. If you'd like to place a new order, please select option 1 to see our menu.",
        });
      }
      break;

    case pattern.test(option):
      if (session.menuDisplayed) {
        const items = option.split(",");
        const order = menu.filter((item) => items.includes(item.id.toString()));
        const total = order.reduce(
          (prevValue, item) => prevValue + item.price,
          0
        );
        emitBotResponseEvent(socket, "orderSummary", { order, total });
        session.currentOrder = { order, total };
        saveToSession(session);
      } else {
        emitBotResponseEvent(socket, "menu", { menu });
        session.menuDisplayed = true;
        saveToSession(session);
        emitBotResponseEvent(socket, "", {
          text: "Please check our current menu list above 👆 before placing your order, as it may have changed since your last order. Thank you!",
        });
      }
      break;

    default:
      emitBotResponseEvent(socket, "unknownInput", {
        text: "I'm sorry, I don't understand. Could you please choose from the options below?",
      });
      break;
  }
};
