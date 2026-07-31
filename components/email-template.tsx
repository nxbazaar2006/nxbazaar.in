import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "react-email";
import * as React from "react";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ??
  process.env.NEXTAUTH_URL ??
  "http://localhost:3000";

interface EmailTemplateProps {
  name?: string;
  redirectUrl?: string;
  linkText?: string;
  description?: string;
  subject?: string;
}

export const EmailTemplate = ({
  name = "",
  redirectUrl = "/login",
  linkText = "Click Here",
  description = "",
  subject = "Nxbazaar.in",
}: EmailTemplateProps) => (
  <Html>
    <Head />
    <Preview>{subject}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Text style={brandName}>Nxbazaar.in</Text>
        </Section>

        {/* Title */}
        <Text style={title}>{linkText}</Text>

        {/* Main Content */}
        <Section style={section}>
          <Text style={text}>
            Hey <strong>{name}</strong>!
          </Text>
          <Text style={text}>{description}</Text>

          <Button
            style={button}
            href={`${baseUrl}/${redirectUrl}`}
          >
            {linkText}
          </Button>

          <Text style={helperText}>
            If the button above doesn&apos;t work, copy and paste this link into your browser:
          </Text>
          <Link style={link} href={`${baseUrl}/${redirectUrl}`}>
            {`${baseUrl}/${redirectUrl}`}
          </Link>
        </Section>

        {/* Footer */}
        <Text style={footer}>
          &copy; {new Date().getFullYear()} Nxbazaar.in. All rights reserved.
        </Text>
        <Text style={footer}>
          If you did not request this email, please ignore it.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default EmailTemplate;

// ─── Styles ───────────────────────────────────────────────────────────────────

const main: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  color: "#24292e",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
};

const container: React.CSSProperties = {
  width: "480px",
  margin: "0 auto",
  padding: "20px 0 48px",
};

const header: React.CSSProperties = {
  backgroundColor: "#16a34a",
  borderRadius: "8px 8px 0 0",
  padding: "20px 24px",
  textAlign: "center",
};

const brandName: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#ffffff",
  margin: "0",
};

const title: React.CSSProperties = {
  fontSize: "24px",
  lineHeight: "1.25",
  fontWeight: "600",
  margin: "20px 0 12px",
};

const section: React.CSSProperties = {
  padding: "24px",
  border: "solid 1px #dedede",
  borderRadius: "5px",
  textAlign: "center",
  backgroundColor: "#ffffff",
};

const text: React.CSSProperties = {
  margin: "0 0 10px 0",
  textAlign: "left",
  fontSize: "15px",
  lineHeight: "1.6",
};

const helperText: React.CSSProperties = {
  margin: "16px 0 4px 0",
  fontSize: "12px",
  color: "#6a737d",
  textAlign: "left",
};

const button: React.CSSProperties = {
  fontSize: "14px",
  backgroundColor: "#16a34a",
  color: "#fff",
  lineHeight: "1.5",
  borderRadius: "0.5em",
  padding: "0.75em 1.5em",
  display: "inline-block",
  margin: "12px 0",
  textDecoration: "none",
};

const link: React.CSSProperties = {
  color: "#0366d6",
  fontSize: "12px",
  wordBreak: "break-all",
};

const footer: React.CSSProperties = {
  color: "#6a737d",
  fontSize: "12px",
  textAlign: "center",
  marginTop: "24px",
};