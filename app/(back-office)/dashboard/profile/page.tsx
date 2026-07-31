import { auth } from "@/auth";
import React from "react";
export default async function page() { const session = await auth(); if (!session) return; const { user } = session; return ( <div> <h2>Welcome {user?.name} </h2> </div> );
}