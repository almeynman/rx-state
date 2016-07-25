import _ from 'lodash'

export default function wrapActionNames(actionNames, actions) {
  const result = {}
  _.forIn(actionNames, (value, key) => result[key] = value ? actions.get(value) : actions.get(key))
  return result
}
