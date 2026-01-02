
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

interface NewOrderEmailProps {
    orderId: string;
    totalAmount: number;
    deliveryCode: string;
}

export const NewOrderEmail = ({
    orderId,
    totalAmount,
    deliveryCode,
}: NewOrderEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>You have a new order on Entemba!</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>New Order Received</Heading>
                    <Text style={text}>
                        Good news! A customer has placed a new order.
                    </Text>

                    <Section style={statsContainer}>
                        <Text style={statText}>Order ID: <span style={bold}>{orderId}</span></Text>
                        <Text style={statText}>Total Revenue: <span style={bold}>ZMW {totalAmount}</span></Text>
                    </Section>

                    <Hr style={hr} />

                    <Section style={codeBox}>
                        <Text style={codeTitle}>DELIVERY CODE</Text>
                        <Heading style={code}>{deliveryCode}</Heading>
                        <Text style={textSmall}>
                            Request this code from the buyer upon delivery to release your funds.
                        </Text>
                    </Section>

                    <Button
                        href={`https://entemba.shop/vendor/orders/${orderId}`}
                        style={button}
                    >
                        View Order Details
                    </Button>

                    <Text style={footer}>
                        Payments are held in escrow and released 24h after delivery confirmation.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

// Styles
const main = {
    backgroundColor: "#f6f9fc",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
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

const statsContainer = {
    padding: "20px",
    backgroundColor: "#fafafa",
    borderRadius: "8px",
    margin: "20px"
};

const statText = {
    fontSize: "14px",
    color: "#555",
    margin: "5px 0"
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
    background: "#f0fdf4", // green-50
    border: "1px dashed #16a34a", // green-600
    borderRadius: "12px",
    padding: "20px",
    margin: "20px",
    textAlign: "center" as const
};

const codeTitle = {
    color: "#166534",
    fontSize: "12px",
    fontWeight: "bold",
    letterSpacing: "0.05em"
};

const code = {
    color: "#15803d",
    fontSize: "32px",
    letterSpacing: "4px",
    margin: "10px 0"
};

const textSmall = {
    color: "#555",
    fontSize: "12px"
};

const button = {
    backgroundColor: "#000",
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
