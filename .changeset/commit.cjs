/** @type {import('@changesets/types').CommitFunctions["getAddMessage"]} */
module.exports.getAddMessage = async (changeset) => {
  return changeset.summary;
};
