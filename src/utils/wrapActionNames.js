import _ from 'lodash'

export default function wrapActionNames(actionNames, actionFactory) {
  return _.transform(actionNames, (result, value, key) => {
    result[key] = value ? actionFactory.get(value) : actionFactory.get(key)
  }, {})
}
