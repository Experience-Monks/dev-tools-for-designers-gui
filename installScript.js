
var os = require('os');
var exec = require('child-process-promise').exec;
var spawn = require('child-process-promise').spawn;
var env = Object.create(process.env);

var $ = require('jquery');

function installDevTools(form) {
	if(os.platform() === "linux") {
			console.log('performing install for linux');
			linuxInstall(form);		
    	}
    	else if(os.platform() === "darwin") {
			console.log('performing install for OS X');
			darwinInstall(form);
	}
     	else if(os.platform() === "Windows") {
        console.log('performing install for Windows not yet supported');
     	}	 
}

function downloadRepo(repoUrl, repoName, user, pass, org) {
	var Github = require('github-api');
	var gitName = user.toString();
	var gitPass = pass.toString();
	var gitOrg = org.toString();

	var github = new Github({
		username: user,
		password: pass,
		auth: 'basic'
	});
    
        //TODO add logic to handle existing repo
        exec('/usr/bin/git --version')
		.then(() => {
			return exec('/usr/local/bin/node -v')
		})
        .then(() => {
        	return exec('git config --global user.name "' + user + '"');
        })
        .then(function() {
          	env.PATH = '$HOME/.npm-global/bin:/$HOME/bin:/usr/local/bin:$HOME/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin';
            console.log('cloning repo and installing dependencies ' + repoName);
            document.getElementById('progress').innerHTML = 'Cloning repo ' + repoName + ' and installing dependencies....';
            return exec('/usr/bin/git clone https://'+ gitName + ':' + gitPass + '@github.com/' + gitOrg +'/' + repoName + '.git ~/' + repoName + ' || true', { maxBuffer: 1024 * 1000, env: env})
            		.then(() => {
            			return exec('cd ~/' + repoName + ' && /usr/local/bin/git-lfs fetch', { maxBuffer: 1024 * 1000, env: env} );
            		})
            		.then(() => {
  
            			return exec('cd ~/' + repoName +' && npm install --save-dev', { maxBuffer: 1024 * 1000, env: env});  
            		})
            		.finally(() => {
            			console.log('Done git clone');
            		})
             
        })
        .finally(function() {
        	document.getElementById('progress').innerHTML = "Repo cloned and setup succesfully"
            return console.log('DONE');
        })
        .fail((err) => {
        	document.getElementById('progress').innerHTML = '<p>Error ' + err + '</p>'
        	return document.getElementById('progress').innerHTML += '<p>There waas an error, this may be because of broken dependencies in the repo. If you have not installed git and nodejs hit the dev-tools button first.</p>';
        });	
}

function gitGen(form) {
	var Github = require('github-api');
	var gitName =  form.gitName.value;
	var gitPass =  form.gitPass.value;
	
	var github = new Github({
		username: gitName,
		password: gitPass,
		auth: 'basic'
	});
	
	var user = github.getUser();
	user.repos(function (err, repos) {
		console.log("ERR " + err);
		var cont = document.getElementById('container');
		var term = document.getElementById('terminal');
		if(!document.getElementById('gitSelect')) {
			var sel = document.createElement('select');
			sel.id = 'gitSelect';
			sel.setAttribute('form','gitForm');
			
			var downloadButton = document.createElement('input');
			downloadButton.setAttribute('type', 'button');
			downloadButton.setAttribute('class', 'button block');
			downloadButton.setAttribute('name', 'repo');
			downloadButton.setAttribute('value', 'Download repo');
			downloadButton.setAttribute('onclick', 'downloadRepo()');
	
			var optgroup = document.createElement('optgroup');
			var gitForm = document.createElement('form');
			
			gitForm.id = 'gitForm';
			term.appendChild(gitForm);
			sel.id = 'gitSelect';
			gitForm.appendChild(sel);
			optgroup.id = 'gitOpt';
			sel.appendChild(optgroup);

			$(sel).on('change', (d) => {
				var selected = $('#gitOpt :selected').val();
				var sel = selected.split(',');
				downloadButton.setAttribute('onclick', 'downloadRepo(\'' +  sel[1] + '\',\'' + sel[0] + '\',\'' + gitName + '\',\'' + gitPass + '\',\'' +  sel[4] + '\')');
			});
			
			if(repos.length) {
					for(var i = 0; i < repos.length; i++) {
						if(!document.getElementById('link'+i)) {
							var opt = document.createElement('option');
							opt.value= [repos[i].name, repos[i].html_url, gitName.toString(), gitPass, repos[i].owner.login];
							opt.innerHTML += repos[i].name;
							
							optgroup.appendChild(opt);
						}
					}
					gitForm.appendChild(downloadButton);
			}
			else {
				console.log('no repos');
			}
		}
	});
}

function linuxInstall() {
    //linux is incomplete
    exec('curl -L https://npmjs.org/install.sh > install.sh')
    .then(function() {
        return exec('chmod a+x install.sh');
    })
    .then(function() {
        return exec('sh install.sh');
    })
    .then(function() {
        return exec('mkdir ~/.npm-global');
    })
    .then(function() {
        return exec('npm set prefix ~/.npm-global');
    })
    .then(function() {
        return exec('npm install -g n');
    })
    .then(function() {
        return exec('n latest');
    })
    .finally(function() {
        return console.log('DONE');
    })
    .catch(function (err) {
        return console.log('ERROR ' + err);
    });
}



function installX() {
	exec('printf "xcode-select --install" > ~/xcode.command && chmod a+x ~/xcode.command &&  open ~/xcode.command')
}

function darwinInstall(form) {
	//test for node, subl, git, brew not implemented yet
	var sysPass =  form.sysPass.value;
	//exec('xcode-select –-install || true')
	exec('mkdir -p ~/homebrew && /usr/bin/curl -L https://github.com/Homebrew/homebrew/tarball/master | tar xz --strip 1 -C ~/homebrew')
	.then(function() {
		return exec('echo ' + sysPass + ' | sudo -S chmod -R 777 /usr/local'); 
	})
	.then(function () {
		return exec('mkdir -p /usr/local/bin && mkdir -p /usr/local/share/doc && mkdir -p /usr/local/share/man/man1 || true');
	})
	.then(function() {
		console.log('homebrew install');
		return exec('ln -sf ~/homebrew/Library /usr/local/Library && ln -sf ~/homebrew/bin/brew /usr/local/bin/brew && ln -sf ~/homebrew/share/doc/homebrew/ /usr/local/share/doc/homebrew &&  ln -sf ~/homebrew/share/man/man1/brew.1 /usr/local/share/man/man1/brew.1 && ln -sf ~/homebrew/.yardopts /usr/local/.yardopts &&  ln -sf ~/homebrew/.travis.yml  /usr/local/.travis.yml && ln -sf ~/homebrew/.gitignore  /usr/local/.gitignore')
	})
	.then(function () {
		console.log('install git and dependencies');
		return exec('/usr/local/bin/brew install xz')
	})
	.then(() => {
		return exec('/usr/local/bin/brew link --overwrite xz');
	})
	.then(() => {
		return exec('/usr/local/bin/brew install git');
	})
	.then(() => {
		return exec('/usr/local/bin/brew link --overwrite git');
	})
	.then(() => {
		document.getElementById('progress').innerHTML = 'Installing Nodejs. May take a while';
		return exec('usr/local/bin/brew install node && /usr/local/bin/brew link --overwrite node || true', { maxBuffer: 1024 * 2000})
				.then((r) => {
					console.log('OUT: ' + r.stdout);
				});
	}) 
	.then(function() {
        return exec('rm -rf ~/.npm-global && mkdir ~/.npm-global || true');
    })
	.then(() => {
		return exec('echo prefix=~/.npm-global >> ~/.npmrc');
	}) 
	.then(() => {
		return exec('/usr/bin/curl -L https://www.npmjs.com/install.sh >> ~/install.sh')
				.then(() => {
					env.PATH = '$HOME/.npm-global/bin:/$HOME/bin:/usr/local/bin:$HOME/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin'
					return exec('sh ~/install.sh', {env: env});
				});
	})
	.then(function() {
        document.getElementById('progress').innerHTML = 'Adding executables to PATH variable';
        return exec('printf "export PATH=$HOME/.npm-global/bin:/$HOME/bin:/usr/local/bin:$HOME/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin" >>  ~/.bash_profile');
    })
    .then(function() {
        console.log('source');
        return exec('source ~/.bash_profile');
    })
	.then(function() {
						document.getElementById('progress').innerHTML = 'Installing Sublime...';
						return exec('mkdir -p /Volumes/mnt')
							   .then(function() {
							   		console.log('curl sub');
									return exec('/usr/bin/curl  -o ~/Sublime%20Text%202.0.2.dmg  -O  http://c758482.r82.cf2.rackcdn.com/Sublime%20Text%202.0.2.dmg'); 
								})
								.then(function() {
									console.log('mnt');
									return exec('/usr/bin/hdiutil  attach -mountpoint /Volumes/mnt ~/Sublime%20Text%202.0.2.dmg');
								})
								.then(function() {
									console.log('cp sub app');
									return exec('cp -rf /Volumes/mnt/Sublime\\ Text\\ 2.app /Applications/');
								})
								.then(function() {
									console.log('detach');
									return exec('/usr/bin/hdiutil detach /Volumes/mnt');
								})
								.then(function() {
									console.log('mkdir bin');
									return exec('mkdir -p ~/bin');
								})
								.then(function() {
									console.log('ln');
									return exec('ln -sf "/Applications/Sublime Text 2.app/Contents/SharedSupport/bin/subl" ~/bin/subl');
								});
	})
    .then(function() {
        console.log('curl git');
        document.getElementById('progress').innerHTML = "Retrieving Github Desktop...";
        return exec('/usr/bin/curl -o ~/git.zip -L https://central.github.com/mac/latest');
    })
    .then(function() {
        console.log('unzip git');
        //maxBuffer is set large to prevent stdout error
        return exec('unzip -o ~/git.zip -d ~/GithubDesktop', { maxBuffer: 1024 * 500});
    })
    .then(function() {
        console.log('Opening Git desktop app');
        document.getElementById('progress').innerHTML = "Opening Github Desktop";
        return exec('open ~/GithubDesktop/*');
    })
    .then(function() {
        console.log('installing git lfs');
        document.getElementById('progress').innerHTML = "Installing git lfs";
        return exec('/usr/local/bin/brew install git-lfs || true ');
    })
	.then(function() {
		document.getElementById('progress').innerHTML = "Done installing dev tools";
		console.log('done install');
	})
    .catch(function (err) {
        return console.dir('ERROR ' + JSON.stringify(err));
    });
}