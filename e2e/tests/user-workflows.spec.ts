import { test, expect } from '@playwright/test';

test.describe('Complete User Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Daily Note-Taking Workflow', () => {
    test('should complete a typical daily workflow', async ({ page }) => {
      // 1. Start the day - create a daily journal entry
      await page.click('[data-testid="create-note-button"]');
      await page.locator('[data-testid="note-title-input"]').fill('Daily Journal - ' + new Date().toDateString());
      
      const editor = page.locator('[data-testid="note-editor"] .cm-content');
      await editor.click();
      await editor.type(`# Daily Journal\n\n## Goals for Today\n- [ ] Complete project proposal\n- [ ] Review team feedback\n- [ ] Plan weekend activities\n\n## Notes\n`);
      
      // Add tags for organization
      const tagInput = page.locator('[data-testid="tag-input"]');
      if (await tagInput.isVisible()) {
        await tagInput.click();
        await tagInput.type('journal');
        await page.keyboard.press('Enter');
        
        await tagInput.type('daily');
        await page.keyboard.press('Enter');
      }
      
      await page.waitForTimeout(1500); // Auto-save
      
      // 2. Create a meeting note
      await page.click('[data-testid="create-note-button"]');
      await page.locator('[data-testid="note-title-input"]').fill('Team Meeting - Project Alpha');
      
      await page.locator('[data-testid="note-editor"] .cm-content').click();
      await page.locator('[data-testid="note-editor"] .cm-content').type(`# Team Meeting Notes\n\n**Date:** ${new Date().toDateString()}\n**Attendees:** John, Sarah, Mike\n\n## Agenda\n1. Project status update\n2. Budget review\n3. Next milestones\n\n## Action Items\n- [ ] John: Update timeline\n- [ ] Sarah: Budget analysis\n- [ ] Mike: Client presentation`);
      
      // Add tags
      if (await tagInput.isVisible()) {
        await tagInput.click();
        await tagInput.type('meeting');
        await page.keyboard.press('Enter');
        
        await tagInput.type('project-alpha');
        await page.keyboard.press('Enter');
        
        await tagInput.type('work');
        await page.keyboard.press('Enter');
      }
      
      await page.waitForTimeout(1500);
      
      // 3. Create a quick idea note
      await page.click('[data-testid="create-note-button"]');
      await page.locator('[data-testid="note-title-input"]').fill('💡 App Feature Idea');
      
      await page.locator('[data-testid="note-editor"] .cm-content').click();
      await page.locator('[data-testid="note-editor"] .cm-content').type(`# Feature Idea: Dark Mode Toggle\n\n## Problem\nUsers want dark mode for night-time usage\n\n## Solution\n- Add toggle in settings\n- Remember user preference\n- Apply to all components\n\n## Implementation\n1. CSS variables for themes\n2. localStorage for persistence\n3. System preference detection`);
      
      // Pin this important idea
      const noteItem = page.locator('[data-testid="note-item"]').first();
      await noteItem.click({ button: 'right' });
      await page.click('[data-testid="pin-note-button"]');
      
      await page.waitForTimeout(1500);
      
      // 4. Search for previous meeting notes
      await page.keyboard.press('Control+k');
      await page.locator('[data-testid="search-input"]').type('meeting project');
      
      await expect(page.locator('[data-testid="search-results"]')).toContainText('Team Meeting');
      await page.keyboard.press('Escape');
      
      // 5. End of day - update daily journal
      await page.click('[data-testid="note-item"]'); // Click daily journal (should be in list)
      
      // Find and click the daily journal note
      const notesList = page.locator('[data-testid="notes-list"]');
      await notesList.locator('text=Daily Journal').click();
      
      // Add to the journal
      await page.locator('[data-testid="note-editor"] .cm-content').click();
      await page.keyboard.press('Control+End'); // Go to end
      await page.locator('[data-testid="note-editor"] .cm-content').type(`\n\n## End of Day Reflection\n- Completed team meeting ✓\n- New feature idea captured ✓\n- Good progress on project alpha\n\n**Tomorrow's priorities:**\n1. Follow up on action items\n2. Research dark mode implementation\n3. Prepare client presentation`);
      
      await page.waitForTimeout(1500);
      
      // Verify workflow completion
      await expect(page.locator('[data-testid="notes-list"]')).toContainText('Daily Journal');
      await expect(page.locator('[data-testid="notes-list"]')).toContainText('Team Meeting');
      await expect(page.locator('[data-testid="notes-list"]')).toContainText('App Feature Idea');
      
      // Verify pinned note is at top
      const firstNote = page.locator('[data-testid="note-item"]').first();
      await expect(firstNote).toContainText('App Feature Idea');
    });
  });

  test.describe('Research and Writing Workflow', () => {
    test('should support research and long-form writing', async ({ page }) => {
      // 1. Create research outline
      await page.click('[data-testid="create-note-button"]');
      await page.locator('[data-testid="note-title-input"]').fill('Research: Sustainable Energy Solutions');
      
      const editor = page.locator('[data-testid="note-editor"] .cm-content');
      await editor.click();
      await editor.type(`# Sustainable Energy Research\n\n## Research Questions\n1. What are the most efficient renewable energy sources?\n2. How can we improve energy storage?\n3. What are the economic implications?\n\n## Sources to Review\n- [ ] MIT Energy Lab reports\n- [ ] Tesla battery technology\n- [ ] European wind farm data\n- [ ] Solar panel efficiency studies\n\n## Key Findings\n*(To be filled as research progresses)*`);
      
      // Add research tags
      const tagInput = page.locator('[data-testid="tag-input"]');
      if (await tagInput.isVisible()) {
        await tagInput.click();
        await tagInput.type('research');
        await page.keyboard.press('Enter');
        
        await tagInput.type('energy');
        await page.keyboard.press('Enter');
        
        await tagInput.type('sustainability');
        await page.keyboard.press('Enter');
      }
      
      await page.waitForTimeout(1500);
      
      // 2. Create individual research notes
      const researchTopics = [
        {
          title: 'Solar Panel Efficiency Study',
          content: `# Solar Panel Efficiency\n\n## Key Statistics\n- Modern panels: 20-22% efficiency\n- Lab records: Up to 47% efficiency\n- Cost per watt: $0.20-0.40\n\n## Sources\n- NREL 2023 Report\n- Stanford Solar Lab\n\n## Notes\nEfficiency improvements plateau, focus shifting to cost reduction and durability.`,
          tags: ['research', 'solar', 'efficiency']
        },
        {
          title: 'Wind Energy Economics',
          content: `# Wind Energy Economics\n\n## Cost Analysis\n- LCOE: $0.02-0.05 per kWh\n- Installation cost: $1,500-2,000 per kW\n- Maintenance: 2-3% of capex annually\n\n## Market Trends\n- Offshore wind growth: 15% yearly\n- Grid integration challenges\n- Storage requirements increasing\n\n## Key Insight\nWind + storage becoming cost-competitive with fossil fuels in many regions.`,
          tags: ['research', 'wind', 'economics']
        }
      ];
      
      for (const topic of researchTopics) {
        await page.click('[data-testid="create-note-button"]');
        await page.locator('[data-testid="note-title-input"]').fill(topic.title);
        
        await page.locator('[data-testid="note-editor"] .cm-content').click();
        await page.locator('[data-testid="note-editor"] .cm-content').type(topic.content);
        
        // Add tags
        if (await tagInput.isVisible()) {
          for (const tag of topic.tags) {
            await tagInput.click();
            await tagInput.type(tag);
            await page.keyboard.press('Enter');
          }
        }
        
        await page.waitForTimeout(1000);
      }
      
      // 3. Update research outline with findings
      await page.keyboard.press('Control+k'); // Search
      await page.locator('[data-testid="search-input"]').type('Research: Sustainable');
      await page.click('[data-testid="search-result-item"]');
      await page.keyboard.press('Escape');
      
      // Add findings to outline
      await page.locator('[data-testid="note-editor"] .cm-content').click();
      await page.keyboard.press('Control+End');
      await page.locator('[data-testid="note-editor"] .cm-content').type(`\n\n## Updated Findings\n\n### Solar Energy\n- Current efficiency: 20-22% (commercial)\n- Cost: $0.20-0.40 per watt\n- **Insight:** Focus on cost reduction vs efficiency gains\n\n### Wind Energy\n- LCOE: $0.02-0.05 per kWh\n- Growth: 15% annually (offshore)\n- **Insight:** Wind + storage = competitive with fossil fuels\n\n## Next Steps\n1. Research battery storage solutions\n2. Analyze grid integration challenges\n3. Economic modeling for different regions`);
      
      await page.waitForTimeout(1500);
      
      // 4. Create final summary document
      await page.click('[data-testid="create-note-button"]');
      await page.locator('[data-testid="note-title-input"]').fill('📄 Sustainable Energy - Executive Summary');
      
      await page.locator('[data-testid="note-editor"] .cm-content').click();
      await page.locator('[data-testid="note-editor"] .cm-content').type(`# Sustainable Energy Solutions - Executive Summary\n\n## Overview\nComprehensive analysis of renewable energy technologies and their economic viability.\n\n## Key Findings\n\n### Technology Readiness\n- **Solar:** Mature technology, focus on cost optimization\n- **Wind:** Rapid growth, especially offshore installations\n- **Storage:** Critical bottleneck, improving rapidly\n\n### Economic Outlook\n- Renewables increasingly cost-competitive\n- Storage costs dropping 15-20% annually\n- Grid modernization required for full adoption\n\n## Recommendations\n1. Invest in storage technology development\n2. Modernize grid infrastructure\n3. Policy support for offshore wind\n4. Focus R&D on storage and grid integration\n\n## Supporting Research\n*(Links to detailed research notes)*\n- [[Solar Panel Efficiency Study]]\n- [[Wind Energy Economics]]\n- [[Research: Sustainable Energy Solutions]]`);
      
      // Pin the summary
      const summaryNote = page.locator('[data-testid="note-item"]').first();
      await summaryNote.click({ button: 'right' });
      await page.click('[data-testid="pin-note-button"]');
      
      // Verify research workflow
      await expect(page.locator('[data-testid="notes-list"]')).toContainText('Executive Summary');
      await expect(page.locator('[data-testid="notes-list"]')).toContainText('Solar Panel Efficiency');
      await expect(page.locator('[data-testid="notes-list"]')).toContainText('Wind Energy Economics');
      
      // Test cross-referencing with search
      await page.keyboard.press('Control+k');
      await page.locator('[data-testid="search-input"]').type('research energy');
      
      const searchResults = page.locator('[data-testid="search-results"]');
      await expect(searchResults).toContainText('Solar Panel');
      await expect(searchResults).toContainText('Wind Energy');
      await expect(searchResults).toContainText('Sustainable Energy');
    });
  });

  test.describe('Project Management Workflow', () => {
    test('should support project planning and tracking', async ({ page }) => {
      // 1. Create project overview
      await page.click('[data-testid="create-note-button"]');
      await page.locator('[data-testid="note-title-input"]').fill('🚀 Project Alpha - Overview');
      
      const editor = page.locator('[data-testid="note-editor"] .cm-content');
      await editor.click();
      await editor.type(`# Project Alpha - Mobile App Development\n\n## Project Goals\n- Launch iOS and Android app by Q3\n- 10,000+ downloads in first month\n- 4.5+ star rating\n\n## Timeline\n- **Phase 1:** Design & Planning (4 weeks)\n- **Phase 2:** Development (8 weeks) \n- **Phase 3:** Testing & Launch (4 weeks)\n\n## Team\n- Project Manager: Sarah\n- Lead Developer: John\n- Designer: Mike\n- QA: Lisa\n\n## Budget\n- Development: $150,000\n- Marketing: $50,000\n- Infrastructure: $25,000\n\n## Status: 🟡 In Progress`);
      
      // Add project tags
      const tagInput = page.locator('[data-testid="tag-input"]');
      if (await tagInput.isVisible()) {
        await tagInput.click();
        await tagInput.type('project-alpha');
        await page.keyboard.press('Enter');
        
        await tagInput.type('mobile-app');
        await page.keyboard.press('Enter');
        
        await tagInput.type('project-management');
        await page.keyboard.press('Enter');
      }
      
      await page.waitForTimeout(1500);
      
      // 2. Create sprint planning notes
      const sprints = [
        {
          title: 'Sprint 1 - User Authentication',
          content: `# Sprint 1 Planning\n\n## Duration\n2 weeks (Oct 1-14)\n\n## Goals\n- Complete user registration/login\n- Implement OAuth integration\n- Basic profile management\n\n## User Stories\n- [ ] As a user, I can create an account\n- [ ] As a user, I can log in with email/password\n- [ ] As a user, I can log in with Google/Apple\n- [ ] As a user, I can reset my password\n- [ ] As a user, I can update my profile\n\n## Definition of Done\n- All tests passing\n- Code reviewed\n- Security audit completed\n- Documentation updated\n\n## Risks\n- OAuth integration complexity\n- GDPR compliance requirements`
        },
        {
          title: 'Sprint 2 - Core Features',
          content: `# Sprint 2 Planning\n\n## Duration\n2 weeks (Oct 15-28)\n\n## Goals\n- Main app functionality\n- Data synchronization\n- Offline support\n\n## User Stories\n- [ ] As a user, I can create/edit items\n- [ ] As a user, I can sync across devices\n- [ ] As a user, I can work offline\n- [ ] As a user, I can search my data\n- [ ] As a user, I can organize with categories\n\n## Technical Tasks\n- Database schema finalization\n- Sync algorithm implementation\n- Offline storage strategy\n- Search indexing\n\n## Dependencies\n- Sprint 1 completion\n- Backend API ready\n- Cloud storage setup`
        }
      ];
      
      for (const sprint of sprints) {
        await page.click('[data-testid="create-note-button"]');
        await page.locator('[data-testid="note-title-input"]').fill(sprint.title);
        
        await page.locator('[data-testid="note-editor"] .cm-content').click();
        await page.locator('[data-testid="note-editor"] .cm-content').type(sprint.content);
        
        // Add sprint tags
        if (await tagInput.isVisible()) {
          await tagInput.click();
          await tagInput.type('project-alpha');
          await page.keyboard.press('Enter');
          
          await tagInput.type('sprint-planning');
          await page.keyboard.press('Enter');
          
          await tagInput.type('development');
          await page.keyboard.press('Enter');
        }
        
        await page.waitForTimeout(1000);
      }
      
      // 3. Create meeting notes for sprint review
      await page.click('[data-testid="create-note-button"]');
      await page.locator('[data-testid="note-title-input"]').fill('Sprint 1 Review Meeting');
      
      await page.locator('[data-testid="note-editor"] .cm-content').click();
      await page.locator('[data-testid="note-editor"] .cm-content').type(`# Sprint 1 Review\n\n**Date:** ${new Date().toDateString()}\n**Attendees:** Sarah, John, Mike, Lisa, Product Owner\n\n## Completed Stories\n✅ User registration system\n✅ Email/password authentication  \n✅ OAuth integration (Google)\n✅ Basic profile management\n\n## Not Completed\n❌ Apple OAuth (moved to Sprint 2)\n❌ Password reset flow (90% done)\n\n## Demo Feedback\n- Registration flow is intuitive\n- Need better error messages\n- Apple login is important for iOS users\n- Profile page needs more fields\n\n## Metrics\n- Velocity: 23 story points\n- Bugs found: 3 (all fixed)\n- Test coverage: 85%\n\n## Action Items\n- [ ] John: Complete Apple OAuth by Monday\n- [ ] Mike: Improve error message design\n- [ ] Lisa: Add automation tests for auth flow\n- [ ] Sarah: Update Sprint 2 priorities\n\n## Retrospective\n**What went well:**\n- Good team collaboration\n- OAuth integration smoother than expected\n- Automated testing catching issues early\n\n**What to improve:**\n- Better estimation for OAuth complexity\n- More frequent code reviews\n- Earlier design reviews`);
      
      // Add meeting tags
      if (await tagInput.isVisible()) {
        await tagInput.click();
        await tagInput.type('project-alpha');
        await page.keyboard.press('Enter');
        
        await tagInput.type('sprint-review');
        await page.keyboard.press('Enter');
        
        await tagInput.type('meeting');
        await page.keyboard.press('Enter');
      }
      
      await page.waitForTimeout(1500);
      
      // 4. Update project overview with progress
      await page.keyboard.press('Control+k');
      await page.locator('[data-testid="search-input"]').type('Project Alpha - Overview');
      await page.click('[data-testid="search-result-item"]');
      await page.keyboard.press('Escape');
      
      // Update status
      await page.locator('[data-testid="note-editor"] .cm-content').click();
      await page.keyboard.press('Control+End');
      await page.locator('[data-testid="note-editor"] .cm-content').type(`\n\n## Progress Update - ${new Date().toDateString()}\n\n### Sprint 1 Completed ✅\n- User authentication system live\n- OAuth integration working\n- Basic profile management done\n- **Velocity:** 23 story points\n\n### Current Status\n- **Phase 1:** 60% complete\n- **Timeline:** On track\n- **Budget:** Under budget by 5%\n- **Risks:** Apple OAuth complexity (low impact)\n\n### Next Sprint Focus\n- Core app features\n- Data synchronization\n- Offline support\n- Search functionality\n\n### Key Metrics\n- Development velocity: 23 pts/sprint\n- Bug rate: 0.13 bugs/story\n- Test coverage: 85%\n- Team satisfaction: 8.5/10`);
      
      await page.waitForTimeout(1500);
      
      // Verify project management workflow
      await expect(page.locator('[data-testid="notes-list"]')).toContainText('Project Alpha - Overview');
      await expect(page.locator('[data-testid="notes-list"]')).toContainText('Sprint 1 - User Authentication');
      await expect(page.locator('[data-testid="notes-list"]')).toContainText('Sprint 2 - Core Features');
      await expect(page.locator('[data-testid="notes-list"]')).toContainText('Sprint 1 Review Meeting');
      
      // Test project search and filtering
      await page.keyboard.press('Control+k');
      await page.locator('[data-testid="search-input"]').type('project-alpha');
      
      const searchResults = page.locator('[data-testid="search-results"]');
      await expect(searchResults).toContainText('Project Alpha');
      await expect(searchResults).toContainText('Sprint 1');
      await expect(searchResults).toContainText('Sprint 2');
      await expect(searchResults).toContainText('Review Meeting');
    });
  });

  test.describe('Learning and Knowledge Management', () => {
    test('should support learning documentation and knowledge base', async ({ page }) => {
      // 1. Create learning roadmap
      await page.click('[data-testid="create-note-button"]');
      await page.locator('[data-testid="note-title-input"]').fill('📚 TypeScript Learning Path');
      
      const editor = page.locator('[data-testid="note-editor"] .cm-content');
      await editor.click();
      await editor.type(`# TypeScript Learning Path\n\n## Learning Goals\n- Master TypeScript fundamentals\n- Advanced type system\n- Real-world project implementation\n- Testing with TypeScript\n\n## Roadmap (8 weeks)\n\n### Week 1-2: Fundamentals\n- [ ] Basic types and interfaces\n- [ ] Functions and classes\n- [ ] Modules and namespaces\n- [ ] Compilation and configuration\n\n### Week 3-4: Advanced Types\n- [ ] Generics and constraints\n- [ ] Union and intersection types\n- [ ] Mapped types\n- [ ] Conditional types\n\n### Week 5-6: Real-world Usage\n- [ ] React with TypeScript\n- [ ] Node.js backend\n- [ ] Testing strategies\n- [ ] Performance optimization\n\n### Week 7-8: Project\n- [ ] Build full-stack app\n- [ ] Code review and refactoring\n- [ ] Documentation\n- [ ] Deployment\n\n## Resources\n- TypeScript Handbook\n- Effective TypeScript book\n- TypeScript Deep Dive\n- Practice projects on GitHub\n\n## Progress Tracking\n**Current Status:** Week 2 - Fundamentals\n**Confidence Level:** 6/10\n**Next Milestone:** Complete interface exercises`);
      
      // Add learning tags
      const tagInput = page.locator('[data-testid="tag-input"]');
      if (await tagInput.isVisible()) {
        await tagInput.click();
        await tagInput.type('learning');
        await page.keyboard.press('Enter');
        
        await tagInput.type('typescript');
        await page.keyboard.press('Enter');
        
        await tagInput.type('programming');
        await page.keyboard.press('Enter');
        
        await tagInput.type('roadmap');
        await page.keyboard.press('Enter');
      }
      
      await page.waitForTimeout(1500);
      
      // 2. Create detailed learning notes
      const learningNotes = [
        {
          title: 'TypeScript Basics - Types and Interfaces',
          content: `# TypeScript Basics\n\n## Primitive Types\n\`\`\`typescript\nlet name: string = "John";\nlet age: number = 30;\nlet isActive: boolean = true;\nlet items: string[] = ["a", "b", "c"];\n\`\`\`\n\n## Interfaces\n\`\`\`typescript\ninterface User {\n  id: number;\n  name: string;\n  email: string;\n  isActive?: boolean; // Optional\n}\n\nconst user: User = {\n  id: 1,\n  name: "John Doe",\n  email: "john@example.com"\n};\n\`\`\`\n\n## Key Learnings\n- Use interfaces for object shapes\n- Optional properties with ?\n- Array typing: Type[] or Array<Type>\n- Union types: string | number\n\n## Practice Exercises\n✅ Create User interface\n✅ Implement array of users\n✅ Add optional properties\n❌ Complex nested interfaces (todo)\n\n## Questions to Research\n- When to use interfaces vs types?\n- How to extend interfaces?\n- Best practices for optional properties?`,
          tags: ['learning', 'typescript', 'basics', 'week-1']
        },
        {
          title: 'TypeScript Functions and Generics',
          content: `# Functions and Generics\n\n## Function Types\n\`\`\`typescript\n// Function declaration\nfunction greet(name: string): string {\n  return \`Hello, \${name}!\`;\n}\n\n// Arrow function\nconst add = (a: number, b: number): number => a + b;\n\n// Optional parameters\nfunction createUser(name: string, age?: number): User {\n  return { name, age: age || 0 };\n}\n\`\`\`\n\n## Generics\n\`\`\`typescript\n// Generic function\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n\n// Generic interface\ninterface ApiResponse<T> {\n  data: T;\n  status: number;\n  message: string;\n}\n\n// Usage\nconst userResponse: ApiResponse<User> = {\n  data: { id: 1, name: "John" },\n  status: 200,\n  message: "Success"\n};\n\`\`\`\n\n## Key Insights\n- Generics provide type safety with flexibility\n- Use constraints with extends keyword\n- Generic functions vs generic interfaces\n- Real-world usage in APIs\n\n## Practice Results\n✅ Implemented generic API wrapper\n✅ Created utility functions with generics\n✅ Built type-safe array helpers\n\n## Next Steps\n- Advanced generic constraints\n- Conditional types with generics\n- Generic classes`,
          tags: ['learning', 'typescript', 'functions', 'generics', 'week-2']
        }
      ];
      
      for (const note of learningNotes) {
        await page.click('[data-testid="create-note-button"]');
        await page.locator('[data-testid="note-title-input"]').fill(note.title);
        
        await page.locator('[data-testid="note-editor"] .cm-content').click();
        await page.locator('[data-testid="note-editor"] .cm-content').type(note.content);
        
        // Add tags
        if (await tagInput.isVisible()) {
          for (const tag of note.tags) {
            await tagInput.click();
            await tagInput.type(tag);
            await page.keyboard.press('Enter');
          }
        }
        
        await page.waitForTimeout(1000);
      }
      
      // 3. Create weekly reflection
      await page.click('[data-testid="create-note-button"]');
      await page.locator('[data-testid="note-title-input"]').fill('Week 2 Reflection - TypeScript Learning');
      
      await page.locator('[data-testid="note-editor"] .cm-content').click();
      await page.locator('[data-testid="note-editor"] .cm-content').type(`# Week 2 Learning Reflection\n\n## What I Learned\n- TypeScript basic types and interfaces\n- Function typing and generics\n- How to structure type-safe code\n- Real-world patterns for APIs\n\n## Challenges Faced\n- Generic constraints were confusing initially\n- Understanding when to use interfaces vs types\n- Debugging type errors in complex scenarios\n\n## Breakthroughs\n- Generics clicked when building API wrapper\n- Interfaces make code more readable\n- TypeScript catches bugs early in development\n\n## Confidence Assessment\n**Before Week 2:** 4/10\n**After Week 2:** 7/10\n**Growth:** +3 points\n\n## Time Spent\n- Reading/tutorials: 8 hours\n- Hands-on coding: 12 hours\n- Practice exercises: 6 hours\n- **Total:** 26 hours\n\n## Next Week Focus\n- Advanced type system features\n- Mapped and conditional types\n- Real React component typing\n- Start building practice project\n\n## Resources Used\n✅ TypeScript Handbook (chapters 1-4)\n✅ YouTube tutorials (3 hours)\n✅ Practice exercises on TypeScript playground\n❌ Effective TypeScript book (ordered, arriving next week)\n\n## Knowledge Gaps to Address\n- Complex generic constraints\n- Type guards and narrowing\n- Module augmentation\n- Performance implications of types`);
      
      if (await tagInput.isVisible()) {
        await tagInput.click();
        await tagInput.type('learning');
        await page.keyboard.press('Enter');
        
        await tagInput.type('typescript');
        await page.keyboard.press('Enter');
        
        await tagInput.type('reflection');
        await page.keyboard.press('Enter');
        
        await tagInput.type('week-2');
        await page.keyboard.press('Enter');
      }
      
      await page.waitForTimeout(1500);
      
      // 4. Update learning roadmap with progress
      await page.keyboard.press('Control+k');
      await page.locator('[data-testid="search-input"]').type('TypeScript Learning Path');
      await page.click('[data-testid="search-result-item"]');
      await page.keyboard.press('Escape');
      
      // Update progress
      await page.locator('[data-testid="note-editor"] .cm-content').click();
      await page.keyboard.press('Control+End');
      await page.locator('[data-testid="note-editor"] .cm-content').type(`\n\n## Progress Update - Week 2 Complete\n\n### Completed ✅\n- ✅ Basic types and interfaces\n- ✅ Functions and classes\n- ✅ Modules and namespaces\n- ✅ Compilation and configuration\n\n### Current Metrics\n- **Confidence Level:** 7/10 (+3 from start)\n- **Time Invested:** 26 hours\n- **Practice Projects:** 3 completed\n- **Key Concepts Mastered:** 8/12\n\n### Week 3 Goals\n- Advanced type system\n- Generics deep dive\n- Conditional types\n- Start React integration\n\n### Learning Velocity\n- Concepts per week: 4-5\n- Retention rate: High (can explain to others)\n- Practical application: Successfully typed existing JS project\n\n### Resources Effectiveness\n- TypeScript Handbook: ⭐⭐⭐⭐⭐\n- YouTube tutorials: ⭐⭐⭐⭐\n- Practice exercises: ⭐⭐⭐⭐⭐\n- Community forums: ⭐⭐⭐`);
      
      await page.waitForTimeout(1500);
      
      // Verify learning workflow
      await expect(page.locator('[data-testid="notes-list"]')).toContainText('TypeScript Learning Path');
      await expect(page.locator('[data-testid="notes-list"]')).toContainText('TypeScript Basics');
      await expect(page.locator('[data-testid="notes-list"]')).toContainText('Functions and Generics');
      await expect(page.locator('[data-testid="notes-list"]')).toContainText('Week 2 Reflection');
      
      // Test knowledge base search
      await page.keyboard.press('Control+k');
      await page.locator('[data-testid="search-input"]').type('generics typescript');
      
      const searchResults = page.locator('[data-testid="search-results"]');
      await expect(searchResults).toContainText('Functions and Generics');
      await expect(searchResults).toContainText('Learning Path');
    });
  });
});