# define OS
ifeq ($(shell echo "check_quotes"),"check_quotes")
WINDOWS := yes
else
WINDOWS := no
endif

lint:
	npm run lint

update-modules:
ifeq ($(WINDOWS), yes)
	rmdir /F node_modules/ && del package-lock.json && npm i
else
	rm -rf node_modules/ package-lock.json && npm i
endif

typescript:
	npm run typescript

#git
git-remove-local-branches:
	git branch | grep -v "master" | xargs git branch -D

git-history:
	git log --graph --decorate --oneline

#semantic versioning
patch-version: # x.x.*
	npm version patch && git push --tag && git push && npm publish

minor-version: # x.*.x
	npm version minor && git push --tag && git push && npm publish

major-version: # *.x.x
	npm version major && git push --tag && git push && npm publish
