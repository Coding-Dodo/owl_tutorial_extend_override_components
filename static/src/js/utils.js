odoo.define(
  "owl_tutorial_extend_override_components.utils",
  function (require) {
    "use strict";
    class AlreadyDefinedPatchError extends Error {
      constructor() {
        super(...arguments);
        this.name = "AlreadyDefinedPatchError";
      }
    }
    const classPatchMap = new WeakMap();
    const instancePatchMap = new WeakMap();
    var utils = {
      /**
       * Inspired by web.utils:patch utility function
       *
       * @param {Class} Class
       * @param {string} patchName
       * @param {Object} patch
       * @returns {function} unpatch function
       */
      patchClassMethods: function (Class, patchName, patch) {
        let metadata = classPatchMap.get(Class);
        if (!metadata) {
          metadata = {
            origMethods: {},
            patches: {},
            current: [],
          };
          classPatchMap.set(Class, metadata);
        }
        if (metadata.patches[patchName]) {
          throw new Error(`Patch [${patchName}] already exists`);
        }
        metadata.patches[patchName] = patch;
        applyPatch(Class, patch);
        metadata.current.push(patchName);

        function applyPatch(Class, patch) {
          Object.keys(patch).forEach(function (methodName) {
            const method = patch[methodName];
            if (typeof method === "function") {
              const original = Class[methodName];
              if (!(methodName in metadata.origMethods)) {
                metadata.origMethods[methodName] = original;
              }
              Class[methodName] = function (...args) {
                const previousSuper = this._super;
                this._super = original;
                const res = method.call(this, ...args);
                this._super = previousSuper;
                return res;
              };
            }
          });
        }

        return () => unpatchClassMethods.bind(Class, patchName);
      },

      /**
       * Patch an object and return a function that remove the patch
       * when called.
       *
       * @param {Object} obj Object to patch
       * @param {string} patchName
       * @param {Object} patch
       */
      patchInstanceMethods: function (obj, patchName, patch) {
        if (!instancePatchMap.has(obj)) {
          instancePatchMap.set(obj, {
            original: {},
            patches: [],
          });
        }
        const objDesc = instancePatchMap.get(obj);
        if (objDesc.patches.some((p) => p.name === patchName)) {
          throw new AlreadyDefinedPatchError(
            `Patch ${patchName} is already defined`
          );
        }
        objDesc.patches.push({
          name: patchName,
          patch,
        });

        for (const k in patch) {
          let prevDesc = null;
          let proto = obj;
          do {
            prevDesc = Object.getOwnPropertyDescriptor(proto, k);
            proto = Object.getPrototypeOf(proto);
          } while (!prevDesc && proto);

          const newDesc = Object.getOwnPropertyDescriptor(patch, k);
          if (!objDesc.original.hasOwnProperty(k)) {
            objDesc.original[k] = Object.getOwnPropertyDescriptor(obj, k);
          }
          if (prevDesc) {
            const patchedFnName = `${k} (patch ${patchName})`;

            if (prevDesc.value && typeof newDesc.value === "function") {
              makeIntermediateFunction(
                "value",
                prevDesc,
                newDesc,
                patchedFnName
              );
            }
            if (prevDesc.get || prevDesc.set) {
              // get and set are defined together. If they are both defined
              // in the previous descriptor but only one in the new descriptor
              // then the other will be undefined so we need to apply the
              // previous descriptor in the new one.
              newDesc.get = newDesc.get || prevDesc.get;
              newDesc.set = newDesc.set || prevDesc.set;
              if (prevDesc.get && typeof newDesc.get === "function") {
                makeIntermediateFunction(
                  "get",
                  prevDesc,
                  newDesc,
                  patchedFnName
                );
              }
              if (prevDesc.set && typeof newDesc.set === "function") {
                makeIntermediateFunction(
                  "set",
                  prevDesc,
                  newDesc,
                  patchedFnName
                );
              }
            }
          }

          Object.defineProperty(obj, k, newDesc);
        }

        function makeIntermediateFunction(
          key,
          prevDesc,
          newDesc,
          patchedFnName
        ) {
          const _superFn = prevDesc[key];
          const patchFn = newDesc[key];
          newDesc[key] = {
            [patchedFnName](...args) {
              const prevSuper = this._super;
              this._super = _superFn.bind(this);
              const result = patchFn.call(this, ...args);
              this._super = prevSuper;
              return result;
            },
          }[patchedFnName];
        }
      },

      /**
       * Inspired by web.utils:unpatch utility function
       *
       * @param {Class} Class
       * @param {string} patchName
       */
      unpatchClassMethods: function (Class, patchName) {
        let metadata = classPatchMap.get(Class);
        if (!metadata) {
          return;
        }
        classPatchMap.delete(Class);

        // reset to original
        for (let k in metadata.origMethods) {
          Class[k] = metadata.origMethods[k];
        }

        // apply other patches
        for (let name of metadata.current) {
          if (name !== patchName) {
            patchClassMethods(Class, name, metadata.patches[name]);
          }
        }
      },

      /**
       * @param {Class} Class
       * @param {string} patchName
       */
      unpatchInstanceMethods: function (Class, patchName) {
        return webUtilsUnpatch(Class.prototype, patchName);
      },
    };
    return utils;
  }
);
