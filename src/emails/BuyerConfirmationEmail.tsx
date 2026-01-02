
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Button,
    Hr,
} from "@react-email/components";
import * as React from "react";

interface BuyerConfirmationEmailProps {
    orderId: string;
    totalAmount: number;
    deliveryCode: string;
}

export const BuyerConfirmationEmail = ({
    orderId,
    totalAmount,
    deliveryCode,
}: BuyerConfirmationEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Your Entemba order is confirmed!</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Order Confirmed</Heading>
                    <Text style={text}>
                        Thanks for shopping with us! Your order <span style={bold}>#{orderId}</span> has been received.
                    </Text>

                    <Hr style={hr} />

                    <Section style={codeBox}>
                        <Text style={codeTitle}>YOUR SECURITY CODE</Text>
                        <Heading style={code}>{deliveryCode}</Heading>
                        <Text style={textSmall}>
                            Only show this code to the delivery driver when you receive your package.
                        </Text>
                    </Section>

                    <Button
                        href={`https://entemba.com/orders/${orderId}`}
                        style={button}
                    >
                        Track Order
                    </Button>

                    <Text style={footer}>
                        Need help? Reply to this email.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

// Styles (Simplified reuse)
const main = {
    backgroundColor: "#f6f9fc",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
    borderRadius: "8px",
    maxWidth: "600px",
    border: "1px solid #eee"
};

const h1 = {
    color: "#333",
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "30px 0",
};

const text = {
    color: "#333",
    fontSize: "16px",
    lineHeight: "24px",
    textAlign: "center" as const,
};

const bold = {
    fontWeight: "bold",
    color: "#000"
};

const hr = {
    borderColor: "#e6ebf1",
    margin: "20px 0",
};

const codeBox = {
    background: "#eff6ff", // blue-50
    border: "1px dashed #2563eb", // blue-600
    borderRadius: "12px",
    padding: "20px",
    margin: "20px",
    textAlign: "center" as const
};

const codeTitle = {
    color: "#1e40af",
    fontSize: "12px",
    fontWeight: "bold",
    letterSpacing: "0.05em"
};

const code = {
    color: "#1d4ed8",
    fontSize: "32px",
    letterSpacing: "4px",
    margin: "10px 0"
};

const textSmall = {
    color: "#555",
    fontSize: "12px"
};

const button = {
    backgroundColor: "#2563eb",
    borderRadius: "5px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    width: "200px",
    margin: "30px auto",
    padding: "12px",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    lineHeight: "16px",
    textAlign: "center" as const,
};
