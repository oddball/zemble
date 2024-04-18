/* This enables the recommended stuff for @graphql-eslint
- but disables the stuff dependent on a schema setup
 (providing some value even before we've set up graphql config etc). */

module.exports = {
  extends: ['plugin:@graphql-eslint/schema-recommended', 'plugin:@graphql-eslint/operations-recommended'],
  parser: '@graphql-eslint/eslint-plugin',
  plugins: ['@graphql-eslint'],
  rules: {
    '@graphql-eslint/executable-definitions': 0,
    '@graphql-eslint/fields-on-correct-type': 0,
    '@graphql-eslint/fragments-on-composite-type': 0,
    '@graphql-eslint/known-argument-names': 0,
    '@graphql-eslint/known-directives': 0,
    '@graphql-eslint/known-fragment-names': 0,
    '@graphql-eslint/known-type-names': 0,
    '@graphql-eslint/lone-anonymous-operation': 0,
    '@graphql-eslint/naming-convention': [
      2, {
        FieldDefinition: 'camelCase', FragmentDefinition: { forbiddenSuffixes: ['Fragment'], style: 'PascalCase' }, allowLeadingUnderscore: true, types: 'PascalCase',
      },
    ],
    '@graphql-eslint/no-deprecated': 0,
    '@graphql-eslint/no-fragment-cycles': 0,
    '@graphql-eslint/no-hashtag-description': 0,
    '@graphql-eslint/no-typename-prefix': 1,
    '@graphql-eslint/no-undefined-variables': 0,
    '@graphql-eslint/no-unreachable-types': 0,
    '@graphql-eslint/no-unused-fragments': 0,
    '@graphql-eslint/no-unused-variables': 0,
    '@graphql-eslint/one-field-subscriptions': 0,
    '@graphql-eslint/overlapping-fields-can-be-merged': 0,
    '@graphql-eslint/possible-fragment-spread': 0,
    '@graphql-eslint/provided-required-arguments': 0,
    '@graphql-eslint/require-description': 0,
    '@graphql-eslint/require-id-when-available': 0,
    '@graphql-eslint/scalar-leafs': 0,
    '@graphql-eslint/selection-set-depth': [0],
    '@graphql-eslint/strict-id-in-types': 0,
    '@graphql-eslint/unique-argument-names': 0,
    '@graphql-eslint/unique-directive-names-per-location': 0,
    '@graphql-eslint/unique-variable-names': 0,
    '@graphql-eslint/value-literals-of-correct-type': 0,
    '@graphql-eslint/variables-are-input-types': 0,
    '@graphql-eslint/variables-in-allowed-position': 0,
    'spaced-comment': 0,
  },
}
