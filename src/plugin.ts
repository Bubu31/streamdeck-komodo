import streamDeck from "@elgato/streamdeck";
import { StackStatusAction } from "./actions/stack-status";

// Enregistrer les actions
streamDeck.actions.registerAction(new StackStatusAction());

// Connexion au Stream Deck
streamDeck.connect();
