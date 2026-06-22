import { parseResume } from '../lib/resume-parser';

async function test() {
  const sampleText = `
    Rahul Nair
    rahul.nair@email.com
    9876543210

    Education
    BITS Pilani
    Bachelor of Technology in Computer Science
    Class of 2024

    Skills
    React, Node.js, Python, PostgreSQL, AWS

    Experience
    Software Engineering Intern
    Google
    June 2023 - August 2023
    Worked on backend indexing pipeline optimizing processing throughput.

    Projects
    E-Commerce Platform
    Built full stack storefront.
    Technologies: React, Node.js, Express
    https://github.com/rahul/ecom

    Certifications
    AWS Certified Cloud Practitioner
    Amazon
    January 2023
    https://aws.amazon.com/verify/123

    Achievements
    Smart India Hackathon 2023 Winner
  `;

  try {
    const buffer = Buffer.from(sampleText, 'utf8');
    const result = await parseResume(buffer, 'text/plain');
    console.log('Result JSON:');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
