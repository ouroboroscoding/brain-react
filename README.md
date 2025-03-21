# @ouroboros/brain-react
[![npm version](https://img.shields.io/npm/v/@ouroboros/brain-react.svg)](https://www.npmjs.com/package/@ouroboros/brain-react) ![Custom License](https://img.shields.io/npm/l/@ouroboros/brain-react.svg)

Hooks for handling signed in users and their permissions using the
[brain2_oc](https://pypi.org/project/brain2_oc/) service created by Ouroboros
Coding Inc.

## Installation
```console
foo@bar:~$ npm install @ouroboros/brain-react
```

## Using brain-react
If you're using react, this library helps you keep track of who's logged in and
what their permissions are. It also provides several hooks for keeping up to
date on this info.

If you're using brain-react it's recommended you do not use
[@ouroboros/brain](https://www.npmjs.com/package/@ouroboros/brain) directly for
signin / signout, doing so will break brain-react's ability to keep track and
notify downstream components.

### Functions
- [onNoSession](#onnosession)
- [permissionsSubscribe](#permissionssubscribe)
- [signin](#signin)
- [signout](#signout)
- [signup](#signup)
- [subscribe](#subscribe)
- [update](#update)

### Hooks
- [usePermissions](#usepermissions)
- [useRights](#userights)
- [useRightsAll](#userightsall)
- [useUser](#useuser)

### onNoSession
`onNoSession` allows for notification of when an existing session is no longer
valid.

```javascript
import { onNoSession } from '@ouroboros/brain-react';
onNoSession(() => {
  localStorage.removeItem('session');
});
```

### permissionsSubscribe
`permissionsSubscribe` is useful if you're working in a react app but not
actually inside a component where the `usePermissions` or `useRights` hooks
could be used.

Here we just want to be notified whenever any of the permissions are changed,
this is equivalent to the [usePermissions](#usepermissions) hook.
```javascript
import { permissionsSubscribe } from '@ouroboros/brain-react';
const o = permissonsSubscribe(permissions => {
  // do something with all available permissions
});
```
Or maybe we just want to know about all permissions per name, this is equivalent
to the [useRightsAll](#userightsall) hook.
```javascript
import { permissionsSubscribe } from '@ouroboros/brain-react';
const o = permissonsSubscribe(permissions => {
  // do something with my_service_permissions stored by ID
}, 'my_service_permissions');
```
Or finally, we want to know the specific permissions on an ID under a name,
equivalent to the [useRights](#userights) hook with both arguments set.
```javascript
import { permissionsSubscribe } from '@ouroboros/brain-react';
const o = permissonsSubscribe(permissions => {
  // do something with my_service_permissions on ID
  //  '012345679abc4defa0123456789abcde'
}, 'my_service_permissions', '012345679abc4defa0123456789abcde');
```

When you no longer need updates on permissions, use the returned object to
call unsubscribe.
```javascript
import { permissionsSubscribe } from '@ouroboros/brain-react';
const o = permissonsSubscribe(permissions => {
  // do something with all available permissions
});

// Later...
o.unsubscribe();
```

Or, if you can retrieve the function called, but not keep track of the object
returned, you can use `permissionsUnsubscribe`.

```javascript
import {
  permissionsSubscribe, permissionsUnsubscribe
} from '@ouroboros/brain-react';
const f = permissions => {
  // do something with all available permissions
};
permissonsSubscribe(f, 'name', '012345679abc4defa0123456789abcde');

// Later...
permissionsUnsubscribe(f, 'name', '012345679abc4defa0123456789abcde');
```

### signin
`signin` has two variants. One where we log into the system using a session key,
and the other where we use the traditional email and password.

It fetches the user details upon successful sign in and returns them in the
resolve portion of the Promise, as well as triggering any
[usePermissions()](#usepermissions), [useRights()](#userights),
[useRightsAll()](#userightsall), and [useUser()](#useuser) instances. It also
returns the session key.

#### sign in with session key
```javascript
import { signin } from '@ouroboros/brain-react';
import { addMessage } from 'some_provided_module';
const session = localStorage.getItem('session');
if(session) {
  signin(session).then(res => {
    addMessage(`Welcome back ${res.user.first_name}`);
  });
}
```

#### sign in with email and password
```javascript
import { signin } from '@ouroboros/brain-react';
import { addMessage } from 'some_provided_module';
signin({
  email: 'me@mydomain.com',
  passwd: '********',
  portal: 'my_app'
}).then(res => {
  localStorage.setItem('session', res.session);
  addMessage(`Thanks for signing in ${res.user.first_name}`);
});
```

### signout
`signout` clears the user and session and triggers the same hooks from `signin`.

```javascript
import { signout } from '@ouroboros/brain-react';
signout();
```

If you need to know when the signout is complete, you can resolve the Promise.
```javascript
import { signout } from '@ouroboros/brain-react';
import { addMessage } from 'some_provided_module';
signout(res => {
  localStorage.removeItem('session');
  addMessage('Goodbye!');
});
```

### signup
`signup` makes the request to create a new user.

```javascript
import { errors } from '@ouroboros/brain';
import { signup } from '@ouroboros/brain-react';
import { addMessage } from 'some_provided_module';
const user = {
  email: 'johnnieb@gmail.com',
  first_name: 'John',
  last_name: 'Smith'
};
signup(user).then(() => {
	addMessage(`Thanks for signing up ${user.first_name}!`);
}, error => {
	if(errors.body.DATA_FIELDS) {
		// process errors in data passed
	} else if(errors.body.DB_DUPLICATE) {
		// process trying to signup with an existing user's email
	} else {
		// process some unknown error
	}
});
```

### subscribe
`subscribe` is useful if you're working in a react app but not actually inside a
component where the `useUser` hook could be used.

```javascript
import { subscribe } from '@ouroboros/brain-react';
const o = subscribe(user => {
  // Do something with new user details
});
```

When you no longer need updates on user details, use the returned object to
call unsubscribe.
```javascript
// Later...
o.unsubscribe();
```

Or, if you can retrieve the function called, but not keep track of the object
returned, you can use `unsubscribe`.

```javascript
import { subscribe, unsubscribe } from '@ouroboros/brain-react';
const f = user => {
  // do something with all new user details
};
subscribe(f);

// Later...
unsubscribe(f);
```

### update
`update` makes a request to the server for the latest info about the user. It
triggers all the hooks.

```javascript
import { update } from '@ouroboros/brain-react';
import { addMessage } from 'some_provided_module';
update().then(user => {
	addMessage(`Hi ${user.first_name}!`);
});
```

### usePermissions
`usePermissions` is useful if you need to keep up to date on what permissions
the currently signed in user has.

```javascript
import { RIGHTS_ALL_ID } from '@ouroboros/brain';
import { usePermissions } from '@ouroboros/brain-react';
import React, { useState } from 'react'
function MyComponent({ id }) {
  const [ updateForm, setUpdateForm ] = useState(false);
  const permissions = usePermissions();
  function deleteMe() {
    // delete the ID
  }
  if(!permissions.my_service_permission ||
     !permissions.my_service_permission[RIGHTS_ALL_ID] ||
     !permissions.my_service_permission[RIGHTS_ALL_ID].read) {
    <div className="error">No access to my_service_permission</div>
  }
  return <div>
    {permissions.my_service_permission[RIGHTS_ALL_ID].delete &&
      <button onClick={deleteMe}>Delete</button>
    }
    {permissions.my_service_permission[RIGHTS_ALL_ID].update &&
      <button onClick={() => setUpdateForm(true)}>Update</button>
    }
    <p>{id}</p>
  </div>;
}
```

### useRights
`useRights` is the subset of `usePermissions`, it's helpful if you're really
only interested in one kind of permission.

```javascript
import { useRights } from '@ouroboros/brain-react';
import React, { useState } from 'react'
function MyComponent({ id }) {
  const [ updateForm, setUpdateForm ] = useState(false);
  const myServicePermission = useRights('my_service_permission');
  function deleteMe() {
    // delete the ID
  }
  if(!myServicePermission || myServicePermission.read) {
    <div className="error">No access to my_service_permission</div>
  }
  return <div>
    {myServicePermission.delete &&
      <button onClick={deleteMe}>Delete</button>
    }
    {myServicePermission.update &&
      <button onClick={() => setUpdateForm(true)}>Update</button>
    }
    <p>{id}</p>
  </div>;
}
```
Only passing the `name` 'my_service_permission' results in `useRights` assuming
[RIGHTS_ALL_ID](https://github.com/ouroboroscoding/brain-js/blob/main/README.md#rights_all_id).
If you're interested in a specific ID instead, pass it as the second argument.

```javascript
import { useRights } from '@ouroboros/brain-react';
import React from 'react'
function MyComponent({ id }) {
  const [ updateForm, setUpdateForm ] = useState(false);
  const myServicePermission = useRights('my_service_permission', id);
  function deleteMe(id) {
    // delete the ID
  }
  if(!myServicePermission || myServicePermission.read) {
      <div className="error">
        No access to my_service_permission using {id}
      </div>
  }
  return <div>
    {myServicePermission.delete &&
      <button onClick={deleteMe}>Delete</button>
    }
    {myServicePermission.update &&
      <button onClick={() => setUpdateForm(true)}>Update</button>
    }
    <p>{id}</p>
  </div>;
}
```

### useRightsAll
`useRightsAll` is like `useRights` except it's not global or specific id, but
based on any changes in any ID under the specific name.

```javascript
import { useRightsAll } from '@ouroboros/brain-react';
import React, { useState } from 'react'
function MyComponent({ id }) {
  const [ records, setRecords ] = useState([ /* some data */ ]);
  const myServicePermissions = useRightsAll('my_service_permission');
  return <div>{records.map(o =>
    <MyRecord
      key={o._id}
      rights={myServicePermissions[o._id] || {}}
      value={o}
    >
  )}</div>
}
```

### useUser
`useUser` is useful if you need to keep up to date on the details of the
currently signed in user.

```javascript
import { useUser } from '@ouroboros/brain-react';
import React from 'react'
function MyComponent({ }) {
  const user = useUser();
  return <div>Hello, {user.first_name}!</div>;
}
```

`useUser` returns `false` if no user is currently signed in.