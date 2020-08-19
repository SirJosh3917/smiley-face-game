//@ts-check
import React from "react";
import GenericAuthenticationPage from "@/ui/components/GenericAuthenticationPage";
import urlPlayer from "@/assets/mmmyep.png";
import history from "@/ui/history";
import { api } from "@/isProduction";
export default () => (
  <GenericAuthenticationPage
    smileyUrl={urlPlayer}
    inputs={[
      { text: (value) => !value ? "Enter your preferred username" : `Hello, ${value}!` },
    ]}
    submit={([ preferredUsername ]) => {
      api.postAuthGuest(preferredUsername)
        .then(result => {
          if (!result.ok) {
            console.warn('Failed to authenticate at guest endpoint', result);
            return;
          }
        
          return result.json()
        })
        .then(json => {
          localStorage.setItem("token", json.token);
          history.push("/lobby");
        });
    }}
  />
);