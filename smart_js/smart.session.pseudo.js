next: function(previous result, previously picked choice) {

	if(session isn't running) then
		don't continue;
	
	if(all items have a session state of 1 [meaning they're completed for that session])
		fire the 'end' event and stop the session with saving data

	if(it's not the first time next() is called) {
	
		check the state we come from and assign rewards to raise the state {
			
			if we just came from the study screen:
				..and the item was new: reward him a bit, raising the state
				..and it was just for review: don't raise the item state
				
			if we just came from the recall screen:
				1.remember the recall answer (wether we pressed yes, maybe or no)
				2. don't raise the item state
				
			if we just came from a quiz:
				1. count up the number of quiz presentations for that item (for the maxQuizzesPerItem option)
				2. if the user got the quiz right: give him 1 progress point, raising the state (if he was confident and selected 'yes' on the recall screen - if he selected 'maybe', give him a bit less)
				   if the user was wrong: by default, give him nothing (no state increase), only if the progressOnFailing option is used
				3. if we are in adaptiveClearance mode, we might have shown him a very hard quiz first - if he got that one right, set the item state to 1 to completely clear that item for that session
				4. if the maximum number of quiz presentations has been passed (as defined in maxQuizzesPerItem), wipe it out of the session regardless of the user performance
				5. at last, collect the quizzing result in an Array that is later sent back to smart.fm
			
		}
	
	}

	if (the user pressed 'no' on recall or quiz) {
		end here, and go to study again
	}

	if(we interacted with each item in the current pool) {
	
		1. try to add the item with the lowest session state (or two if the incrementalPool option is used) from the items outside the pool into the pool
		2. if that worked (meaning if there *was* another item outside the pool that's not completed), remove the item the user performed best at from the pool (the one with the highest state)
		3. also remove any completed items from the pool
		
		now after cleaning up the pool,
		if (the pool is actually empty now) {
			...then that's because all items are completed, and we can fire the 'end' event here and stop the entire session
		}
	
	}
	
	
	.. after assigning the state for the last item, let's decide what to do this time..
	
	if( we come from the recall screen ) {
	
		1. we set the state to quiz
		2. and tell the pool that we interacted with the item (that we 'touched' it)
	
	} else {
	
		1. we have to actually get a new item, which we do by getting the item with the lowest state from the already cleaned up pool
		
		if ( for whatever reason that is not possible ) {
			break out and end the session by stopping it
		}
		
		if ( the item is new and studying is enabled ) {
			set the state to study
		} else {
			1. set the state to recall, if the recall screen is enabled as option - if not, set it to quiz directly
			2. instantiate a new random quiz for that item
			3. and tell the pool that we interacted with the item (that we 'touched' it)
		}
	
	}
	
	finally, trigger the 'next' event to inform the developer what we decided to do!
	
}