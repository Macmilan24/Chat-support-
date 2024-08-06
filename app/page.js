"use client";

import { Analytics } from "@vercel/analytics/react";

import { Box, Button, Stack, TextField } from "@mui/material";
import { Content } from "next/font/google";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState([
    {
      role: "assistant",
      content: `Hi! I'm the HeadStarter support assistant. How can i help you?`,
    },
  ]);

  const sendMessage = async () => {
    setUserMessage("");
    setMessage((message) => [
      ...message,
      { role: "user", content: userMessage },
      { role: "assistant", content: "" },
    ]);

    const response = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ...message,
        { role: "user", content: userMessage },
      ]),
    }).then((res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = "";

      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), {
          stream: true,
        });

        setMessage((message) => {
          let lastMessage = message[message.length - 1];

          let otherMessage = message.slice(0, message.length - 1);

          return [
            ...otherMessage,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });

        return reader.read().then(processText);
      });
    });
  };
  const [userMessage, setUserMessage] = useState("");

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction={"colunm"}
        display="flex"
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"space-between"}
        border="1px solid black"
        height="600px"
        width="500px"
      >
        <Stack
          direction={"colunm"}
          spacing={2}
          display="flex"
          flexDirection="column"
          overflow="auto"
          maxHeight="100%"
          p={2}
        >
          {message.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={message.role === "assistant" ? "blue" : "gray"}
                color="white"
                borderRadius={12}
                marginBottom={2}
                p={2}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={"row"} spacing={2} width={"70%"} marginY={4}>
          <TextField
            label="Message"
            fullWidth
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
      <Analytics />
    </Box>
  );
}
