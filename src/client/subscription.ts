// import React from "react";

// import ClientContext from "./ClientContext";

// function useSubscription(options, callback) {
//   const callbackRef = React.useRef(callback);
//   callbackRef.current = callback;

//   const contextClient = React.useContext(ClientContext);
//   const client = options.client || contextClient;

//   const request = {
//     query: options.query,
//     variables: options.variables,
//   };

//   React.useEffect(() => {
//     const observable = client.createSubscription(request);

//     const subscription = observable.subscribe({
//       next: (result) => {
//         callbackRef.current(result);
//       },
//       error: () => {
//         subscription.unsubscribe();
//       },
//       complete: () => {
//         subscription.unsubscribe();
//       },
//     });

//     return () => {
//       subscription.unsubscribe();
//     };
//   }, []); // eslint-disable-line
//   // the effect should be run when component is mounted and unmounted
// }

// export default useSubscription;
