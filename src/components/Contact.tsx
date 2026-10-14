"use client";

export default function Contact() {
  return (
    <section className="bg-green-900 text-white">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-10 text-green-700">
          Would you like to contact us?
        </h2>

        <p className="text-lg md:text-xl leading-relaxed max-w-4xl mx-auto mb-12">
          Connect with us and let's chat! Whether you're searching for <strong>cheap taxi services near me</strong>, need details about the <strong>cost of a taxi to the airport</strong>, or want to book a <strong>24/7 taxi service</strong>, we're here to help. Send us a message on your favorite social media platform, drop us an email, or call us directly to discuss your needs for <strong>Paris airport transfer</strong>, <strong>wheelchair taxi services near me</strong>, or private taxi service near me.
        </p>

        <p className="mb-8">
          Read more about{" "}
          <a
            href="https://en.wikipedia.org/wiki/Transport_in_Paris"
            className="text-green-700 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Transport in Paris
          </a>.
        </p>

        <a
          href="tel:+94726803498"
          className="text-4xl md:text-5xl font-bold text-green-700 hover:text-green-600 transition block mb-12"
        >
          +94 72 680 3498
        </a>

        <div className="flex justify-center gap-10 mb-12">
          <a href="#" aria-label="Facebook" className="text-4xl hover:text-green-700 transition">
            FB
          </a>
          <a href="#" aria-label="Instagram" className="text-4xl hover:text-green-700 transition">
            IG
          </a>
          <a href="#" aria-label="WhatsApp" className="text-4xl hover:text-green-700 transition">
            WA
          </a>
        </div>

        <p className="text-sm opacity-80">
          © {new Date().getFullYear()} Super Star Travel – All rights reserved. |{" "}
          <a href="#" className="hover:text-green-700">Privacy Policy</a>
        </p>
      </div>
    </section>
  );
}