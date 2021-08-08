odoo.define(
  "owl_tutorial_extend_override_components.ControlPanel",
  function (require) {
    "use strict";
    const ControlPanel = require("web.ControlPanel");
    const { useState } = owl.hooks;

    ControlPanel.patch(
      "owl_tutorial_extend_override_components.ControlPanelCodingDodo",
      (T) => {
        class ControlPanelPatched extends T {
          constructor() {
            super(...arguments);
            this.state = useState({
              customText: "",
            });
            console.log(this.state);
          }

          async willUpdateProps(nextProps) {
            await super.willUpdateProps(nextProps);
            let self = this;
            fetch("https://type.fit/api/quotes")
              .then(function (response) {
                return response.json();
              })
              .then(function (data) {
                let quote = data[Math.floor(Math.random() * data.length)];
                Object.assign(self.state, {
                  customText: `${quote.text} - ${quote.author}`,
                });
              });
          }
        }
        return ControlPanelPatched;
      }
    );
  }
);
