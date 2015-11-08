The library allows you to define the structure of you data:
```javascript
var { DataDefinition } = require('react-rapid');

var personDataDefinition = new DataDefinition({
  Name: {
    required: true,
    maxLength: 40
  },
  ContactMethod: {
    required: true
  },
  Phone: {
    required: function(getState) {
      return getState().state.ContactMethod == 'Mobile';
    },
    validate: function(getState) {
      var phone = getState().state.Phone;
      var validationResult = true;
      // ... validate phone
      return validationResult;
    }
  }
});
```

which can be wrapped into "wrappedPersonData" object that makes it easier to work with data in React components:

```javascript
var App = React.createClass({
  componentWillMount: function() {
    this.wrappedPersonData = personDataDefinition.getWrappedData(
      function() { return { state: this.state, getParentState: function() { return null; } }; }.bind(this),
      function(newState) { this.setState(newState); }.bind(this)
    );
  },
  
  render: function() {
    var data = this.wrappedPersonData.data;
    return <div>
      <TextInputElement data={data.Name} label="Name:" />
      <DropDownElement data={data.ContactMethod} label="Contact Method:" />
      <PhoneElement data={data.Phone} label="Phone Number:" />
    </div>;
  }
});

var TextInputElement = React.createClass({
  _handleChange: function() {
    var newValue = event.target.value;
    var maxLength = this.props.data.meta.maxLength;
    if(!_.isUndefined(maxLength)) {
      newVal = newVal.substring(0, +maxLength);
    }
    this.props.data.val(newValue);
  },
  render: function() {
    return <input value={this.props.data.val()} onChange={this._handleChange} />;
  }
});

```
