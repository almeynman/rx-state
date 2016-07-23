export default function wrapActionNames(actionNames, actions) {
  const result = {}
  actionNames.mapKeys(key => result[key] = actionNames[key] ? actions.get(actionNames[key]) : actions.get(key))
  return result
}
