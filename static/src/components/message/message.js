odoo.define(
  "owl_tutorial_extend_override_components/static/src/components/message/message.js",
  function (require) {
    "use strict";

    const components = {
      Message: require("mail/static/src/components/message/message.js"),
    };

    // Solution 1
    Object.defineProperty(components.Message.prototype, "avatar", {
      get: function () {
        if (
          this.message.author &&
          this.message.author === this.env.messaging.partnerRoot
        ) {
          // Here we replace the Robot with the better CodingDodo Avatar
          return "https://avatars.githubusercontent.com/u/81346769?s=400&u=614004f5f4dace9b3cf743ee6aa3069bff6659a2&v=4";
        } else if (this.message.author) {
          return this.message.author.avatarUrl;
        } else if (this.message.message_type === "email") {
          return "/mail/static/src/img/email_icon.png";
        }
        return "/mail/static/src/img/smiley/avatar.jpg";
      },
    });

    // Solution 2
    const { patch } = require("web.utils");
    patch(
      components.Message,
      "owl_tutorial_extend_override_components/static/src/components/message/message.js",
      {
        /**
         * setup is run just after the component is constructed. This is the standard
         * location where the component can setup its hooks.
         */
        setup() {
          Object.defineProperty(this, "avatar", {
            get: function () {
              return this._get_avatar();
            },
          });
        },
        /**
         * Get the avatar of the user. This function can be overriden
         *
         * @returns {string}
         */
        _get_avatar() {
          if (
            this.message.author &&
            this.message.author === this.env.messaging.partnerRoot
          ) {
            // Here we replace the Robot with the better CodingDodo Avatar
            return "https://avatars.githubusercontent.com/u/81346769?s=400&u=614004f5f4dace9b3cf743ee6aa3069bff6659a2&v=4";
          } else if (this.message.author) {
            return this.message.author.avatarUrl;
          } else if (this.message.message_type === "email") {
            return "/mail/static/src/img/email_icon.png";
          }
          return "/mail/static/src/img/smiley/avatar.jpg";
        },
      }
    );

    // Can be overriden again now
    patch(
      components.Message,
      "another_module/static/src/components/message/message_another_patch.js",
      {
        _get_avatar() {
          let originAvatar = this._super(...arguments);
          console.log("originAvatar", originAvatar);
          if (originAvatar === "/mail/static/src/img/odoobot.png") {
            return "https://avatars.githubusercontent.com/u/81346769?s=400&u=614004f5f4dace9b3cf743ee6aa3069bff6659a2&v=4";
          }
          return originAvatar;
        },
      }
    );

    // Solution 3
    const { QWeb } = owl;
    const patchMixin = require("web.patchMixin");
    const PatchableMessage = patchMixin(components.Message);
    const MessageList = require("mail/static/src/components/message_list/message_list.js");

    PatchableMessage.patch(
      "owl_tutorial_extend_override_components/static/src/components/message/solution_3_patch_message.js",
      (T) => {
        class MessagePatched extends T {
          /**
           * @override property
           */
          get avatar() {
            if (
              this.message.author &&
              this.message.author === this.env.messaging.partnerRoot
            ) {
              // Here we replace the Robot with the better CodingDodo Avatar
              return "https://avatars.githubusercontent.com/u/81346769?s=400&u=614004f5f4dace9b3cf743ee6aa3069bff6659a2&v=4";
            } else if (this.message.author) {
              return this.message.author.avatarUrl;
            } else if (this.message.message_type === "email") {
              return "/mail/static/src/img/email_icon.png";
            }
            return "/mail/static/src/img/smiley/avatar.jpg";
          }
        }
        return MessagePatched;
      }
    );
    MessageList.components.Message = PatchableMessage;

    // Solution 4
    const {
      patchInstanceMethods,
    } = require("owl_tutorial_extend_override_components.utils");
    patchInstanceMethods(
      components.Message.prototype,
      "owl_tutorial_extend_override_components/static/src/components/message/message.js",
      {
        /**
         * Get the avatar of the user. This function can be overriden
         *
         * @returns {string}
         */
        get avatar() {
          if (
            this.message.author &&
            this.message.author === this.env.messaging.partnerRoot
          ) {
            // Here we replace the Robot with the better CodingDodo Avatar
            return "https://avatars.githubusercontent.com/u/81346769?s=400&u=614004f5f4dace9b3cf743ee6aa3069bff6659a2&v=4";
          } else if (this.message.author) {
            return this.message.author.avatarUrl;
          } else if (this.message.message_type === "email") {
            return "/mail/static/src/img/email_icon.png";
          }
          return "/mail/static/src/img/smiley/avatar.jpg";
        },
      }
    );
  }
);
