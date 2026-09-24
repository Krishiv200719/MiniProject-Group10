const express = require("express");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/registrations", (req, res) => {
    const { participantName, email, eventName } = req.body;

    if (!participantName || !email || !eventName) {
        return res.status(400).json({
            success: false,
            message: "participantName, email and eventName are required"
        });
    }

    fs.readFile("registrations.json", "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Unable to read registrations file"
            });
        }

        let registrations;

        try {
            registrations = JSON.parse(data);
        } catch (parseError) {
            return res.status(500).json({
                success: false,
                message: "registrations.json contains invalid JSON"
            });
        }

        const duplicate = registrations.find(
            registration =>
                registration.email.toLowerCase() === email.toLowerCase() &&
                registration.eventName.toLowerCase() === eventName.toLowerCase()
        );

        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: "Already registered for this event"
            });
        }

        const newId =
            registrations.length > 0
                ? Math.max(...registrations.map(r => r.id)) + 1
                : 1;

        const newRegistration = {
            id: newId,
            participantName,
            email,
            eventName
        };

        registrations.push(newRegistration);

        fs.writeFile(
            "registrations.json",
            JSON.stringify(registrations, null, 2),
            "utf8",
            writeErr => {
                if (writeErr) {
                    return res.status(500).json({
                        success: false,
                        message: "Unable to save registration"
                    });
                }

                return res.status(201).json({
                    success: true,
                    message: "Registration successful",
                    data: newRegistration
                });
            }
        );
    });
});

app.get("/registrations", (req, res) => {
    fs.readFile("registrations.json", "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Unable to read registrations file"
            });
        }

        let registrations;

        try {
            registrations = JSON.parse(data);
        } catch (parseError) {
            return res.status(500).json({
                success: false,
                message: "registrations.json contains invalid JSON"
            });
        }

        return res.status(200).json({
            success: true,
            count: registrations.length,
            data: registrations
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});