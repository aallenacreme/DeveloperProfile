import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

// Register the SplitText plugin
gsap.registerPlugin(SplitText);

function animateBallBounce(ballRef, letterRefs, firstNameRef, lastNameRef, subtitleRef, aboutSectionRef) {
  if (!ballRef.current || !letterRefs.current.length) return;

  // Disable scrolling
  document.body.style.overflow = 'hidden';

  const ball = ballRef.current;
  const letters = letterRefs.current.filter(el => el);
  const firstName = firstNameRef.current;
  const lastName = lastNameRef.current;
  const subtitle = subtitleRef.current;
  const container = ball.parentElement;

  // Reset elements to initial state to prevent overlap
  gsap.set([ball, letters, firstName, lastName, subtitle], {
    clearProps: 'all' // Clear previous GSAP properties
  });

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  // Set initial position
  const firstLetterRect = letters[0].getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const startX = firstLetterRect.left - containerRect.left + firstLetterRect.width/2 - 25;
  tl.set(ball, {
    x: startX,
    y: -50,
    opacity: 1
  });

  // Bounce over letters
  letters.forEach((letter, index) => {
    const letterRect = letter.getBoundingClientRect();
    const xPos = letterRect.left - containerRect.left + letterRect.width/2 - 25;
    tl.to(ball, {
      x: xPos,
      y: -70,
      duration: 0.3,
      ease: 'power1.in'
    }, index === 0 ? 0 : '-=0.1')
    .to(ball, {
      y: -40,
      duration: 0.1,
      ease: 'bounce.out'
    })
    .to(letter, {
      scaleY: 1.3, // Stretch vertically for squash-and-stretch
      scaleX: 0.8, // Squash horizontally
      rotation: 10, // Slight clockwise rotation
      color: '#ff0000', // Flash to red
      duration: 0.1,
      ease: 'power2.out'
    }, '-=0.1')
    .to(letter, {
      scaleY: 1, // Return to normal scale
      scaleX: 1,
      rotation: -5, // Wiggle back slightly
      color: 'inherit', // Reset to original color
      duration: 0.1,
      ease: 'elastic.out(1, 0.3)'
    }, '-=0.05')
    .to(letter, {
      rotation: 0, // Finalize rotation
      duration: 0.05
    });
    // Optional: Add particle burst
    /*
    .call(() => {
      createLetterParticles(letterRect.left - containerRect.left + letterRect.width/2, 
                           letterRect.top - containerRect.top, 
                           container);
    }, null, '-=0.1');
    */
  });

  // Split name
  tl.to(ball, {
    x: (containerRect.width - 50) / 2,
    y: -50,
    duration: 0.25
  })
  .to(firstName, {
    x: -50,
    duration: 0.25,
    ease: 'back.out(1.7)'
  }, '-=0.1')
  .to(lastName, {
    x: 50,
    duration: 0.25,
    ease: 'back.out(1.7)'
  }, '-=0.25');

  // Prepare the subtitle for shattering
  const subtitleSplit = new SplitText(subtitle, { 
    type: "chars", 
    charsClass: "char"
  });

  // Store original positions
  gsap.set(subtitleSplit.chars, { 
    position: 'relative',
    display: 'inline-block'
  });

  const subtitleRect = subtitle.getBoundingClientRect();
  const ballX = subtitleRect.left - containerRect.left + subtitleRect.width/2 - 25;
  const ballY = subtitleRect.top - containerRect.top - 25;

  // Drop ball to subtitle
  tl.to(ball, {
    x: ballX,
    y: ballY,
    duration: 0.15,
    ease: 'power1.in',
    onComplete: () => {
      // INSTANT explosion effect when ball hits
      gsap.set(ball, { opacity: 0, scale: 0 });
      
      // Create explosion particles
      createExplosionParticles(ballX + 25, ballY + 25, container);
    }
  })
  // Shatter the subtitle text
  .to(subtitleSplit.chars, {
    keyframes: [
      { 
        y: -10,
        rotation: -10,
        duration: 0.05,
        ease: 'power1.out' 
      },
      { 
        y: () => Math.random() * 200 - 100,
        x: () => Math.random() * 200 - 100,
        rotation: () => Math.random() * 360 - 180,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out'
      }
    ],
    stagger: {
      amount: 0.15,
      from: "center"
    }
  }, '<')
  // Rebuild the text
  .to(subtitleSplit.chars, {
    y: 0,
    x: 0,
    rotation: 0,
    opacity: 1,
    duration: 0.15,
    ease: 'elastic.out(1, 0.3)',
    stagger: 0.015,
    delay: 0.1
  });

  // Return names to original positions and scroll to About Me
  tl.to([firstName, lastName], {
    x: 0,
    duration: 0.15,
    ease: 'elastic.out(1, 0.3)',
    delay: 0.05,
    onComplete: () => {
      // Add space between first and last name
      if (lastName.textContent && !lastName.textContent.startsWith(' ')) {
        lastName.textContent = ' ' + lastName.textContent;
      }
      // Scroll to About Me section
      if (aboutSectionRef?.current) {
        aboutSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      document.body.style.overflow = 'auto';
    }
  });
}

// Helper function to create explosion particles
function createExplosionParticles(x, y, container) {
  const colors = ['#ff0000', '#ffff00', '#ffffff', '#00ffff', '#ff00ff'];
  
  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.className = 'explosion-particle';
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    container.appendChild(particle);
    
    gsap.fromTo(particle, 
      {
        x: x,
        y: y,
        opacity: 1,
        scale: 0
      },
      {
        x: x + (Math.random() - 0.5) * 150,
        y: y + (Math.random() - 0.5) * 150,
        scale: Math.random() * 0.8 + 0.2,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => container.removeChild(particle)
      }
    );
  }
}


    
  


export default animateBallBounce;