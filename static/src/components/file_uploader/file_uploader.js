odoo.define(
  "owl_tutorial_extend_override_components/static/src/components/file_uploader/file_uploader.js",
  function (require) {
    "use strict";

    const components = {
      FileUploader: require("mail/static/src/components/file_uploader/file_uploader.js"),
    };

    const { patch } = require("web.utils");

    patch(
      components.FileUploader,
      "owl_tutorial_extend_override_components/static/src/components/file_uploader/file_uploader.js",
      {
        // You can add your own methods to the Component.
        getMaxSize() {
          return 10000000;
        },
        /**
         * @override
         */
        async uploadFiles(files) {
          for (const file of files) {
            if (file.size > this.getMaxSize()) {
              // Files over 10MB are now rejected
              this.env.services["notification"].notify({
                type: "danger",
                message: owl.utils.escape(
                  `Max file size allowed is 10 MB, This file ${file.name} is too big!`
                ),
              });
              return false;
            }
          }
          return this._super(files);
        },
      }
    );
    console.log(components.FileUploader.prototype);
  }
);
