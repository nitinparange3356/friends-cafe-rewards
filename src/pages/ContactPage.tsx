import Navbar from "@/components/Navbar";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold">Contact Us</h1>
          <p className="text-muted-foreground mt-2">We'd love to hear from you!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border p-6 space-y-5">
              <h2 className="font-display text-xl font-semibold">Friends Cafe</h2>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Address</p>
                  <p className="text-muted-foreground text-sm">123 MG Road, Koramangala,<br />Bengaluru, Karnataka 560034</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Phone</p>
                  <p className="text-muted-foreground text-sm">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Email</p>
                  <p className="text-muted-foreground text-sm">hello@friendscafe.in</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Hours</p>
                  <p className="text-muted-foreground text-sm">Mon – Sun: 8:00 AM – 11:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border h-80 md:h-auto">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.5965836782686!2d77.6146!3d12.9346!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU2JzA0LjYiTiA3N8KwMzYnNTIuNiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 300 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Friends Cafe Location"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
