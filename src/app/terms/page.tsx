export const metadata = {
  title: "Terms of Service - Unbannnable",
  description: "Terms of Service for Unbannnable - AI Reddit Post Optimizer",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 py-20 px-6">
      <div className="max-w-3xl mx-auto prose dark:prose-invert">
        <h1 className="font-heavy-serif text-5xl mb-8 text-[#1A1A1A] dark:text-[#F2F0E9]">
          Terms of Service
        </h1>
        
        <div className="font-sans-body text-[#1A1A1A] dark:text-[#F2F0E9] space-y-6">
          <section>
            <h2 className="font-heavy-serif text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Unbannnable, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="font-heavy-serif text-2xl font-bold mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on Unbannnable for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on the site</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heavy-serif text-2xl font-bold mb-4">3. Disclaimer</h2>
            <p>
              The materials on Unbannnable are provided on an 'as is' basis. Unbannnable makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="font-heavy-serif text-2xl font-bold mb-4">4. Limitations</h2>
            <p>
              In no event shall Unbannnable or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Unbannnable.
            </p>
          </section>

          <section>
            <h2 className="font-heavy-serif text-2xl font-bold mb-4">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on Unbannnable could include technical, typographical, or photographic errors. Unbannnable does not warrant that any of the materials on its website are accurate, complete, or current. Unbannnable may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="font-heavy-serif text-2xl font-bold mb-4">6. Links</h2>
            <p>
              Unbannnable has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Unbannnable of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="font-heavy-serif text-2xl font-bold mb-4">7. Modifications</h2>
            <p>
              Unbannnable may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="font-heavy-serif text-2xl font-bold mb-4">8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction where Unbannnable operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="font-heavy-serif text-2xl font-bold mb-4">9. Contact</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at support@unbannnable.com.
            </p>
          </section>

          <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-12">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
