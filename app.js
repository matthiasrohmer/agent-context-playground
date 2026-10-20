// ===========================================================================
// Scenario 03 (Sources Panel Target): Intentional Promo Discount Bug
// ===========================================================================
// Tip for testers: Open `app.js` in the Chrome DevTools Sources panel, enable
// Comment Mode, and attach a comment to the buggy return line below asking your
// coding agent to subtract `discountAmount` instead of adding it.
function calculateDiscountedTotal(subtotal, discountRate) {
  const discountAmount = subtotal * discountRate;
  // BUG: Accidentally adds the discount amount instead of subtracting it!
  return subtotal + discountAmount;
}

document.addEventListener('DOMContentLoaded', () => {
  // ===========================================================================
  // 1. Theme Toggle
  // ===========================================================================
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const htmlEl = document.documentElement;

  const updateThemeButtonLabel = (theme) => {
    if (themeToggleBtn) {
      themeToggleBtn.textContent = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
  };

  const savedTheme = localStorage.getItem('sandbox_theme') || 'light';
  htmlEl.setAttribute('data-theme', savedTheme);
  updateThemeButtonLabel(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      htmlEl.setAttribute('data-theme', currentTheme);
      localStorage.setItem('sandbox_theme', currentTheme);
      updateThemeButtonLabel(currentTheme);
      updateStarterButtonTelemetry();
    });
  }

  // ===========================================================================
  // 2. Live Environment Diagnostics Bar
  // ===========================================================================
  const viewportValueEl = document.getElementById('diag-viewport');
  const statusValueEl = document.getElementById('diag-status');
  const timestampValueEl = document.getElementById('diag-timestamp');
  const allowlistValueEl = document.getElementById('diag-allowlist');
  const footerServerNoteEl = document.getElementById('footer-server-note');

  const updateDiagnostics = () => {
    const activeHost = window.location.host || 'localhost:5173';
    if (allowlistValueEl) {
      allowlistValueEl.textContent = activeHost;
    }
    if (footerServerNoteEl) {
      footerServerNoteEl.textContent = `Served locally on ${activeHost}`;
    }
    if (viewportValueEl) {
      viewportValueEl.textContent = `${window.innerWidth} × ${window.innerHeight}px`;
    }
    if (statusValueEl) {
      statusValueEl.textContent = navigator.onLine ? 'Online (HTTP 200)' : 'Offline';
    }
    if (timestampValueEl) {
      timestampValueEl.textContent = new Date().toLocaleTimeString();
    }
  };

  updateDiagnostics();
  window.addEventListener('resize', updateDiagnostics);
  window.addEventListener('online', updateDiagnostics);
  window.addEventListener('offline', updateDiagnostics);

  // ===========================================================================
  // 3. Part A — Scenario 01: Elements Panel (Starter Button & Distorted Logo)
  // ===========================================================================
  const starterBtn = document.getElementById('starter-target-btn');
  const starterColorReadout = document.getElementById('starter-btn-color-readout');
  const starterClickReadout = document.getElementById('starter-btn-click-readout');
  const distortedLogoImg = document.getElementById('distorted-logo-img');
  const distortedLogoSizeReadout = document.getElementById('distorted-logo-size-readout');
  let starterClicks = 0;

  const updateStarterButtonTelemetry = () => {
    if (starterBtn && starterColorReadout) {
      const computedBg = window.getComputedStyle(starterBtn).backgroundColor;
      starterColorReadout.textContent = computedBg;
    }
    if (distortedLogoImg && distortedLogoSizeReadout) {
      const rect = distortedLogoImg.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        distortedLogoSizeReadout.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)} px`;
      }
    }
  };

  if (starterBtn) {
    updateStarterButtonTelemetry();
    starterBtn.addEventListener('click', () => {
      starterClicks += 1;
      if (starterClickReadout) {
        starterClickReadout.textContent = `${starterClicks} invocation${starterClicks === 1 ? '' : 's'}`;
      }
      updateStarterButtonTelemetry();
      updateDiagnostics();
    });

    const observer = new MutationObserver(() => {
      updateStarterButtonTelemetry();
    });
    observer.observe(starterBtn, { attributes: true, attributeFilter: ['style', 'class'] });
    if (distortedLogoImg) {
      observer.observe(distortedLogoImg, { attributes: true, attributeFilter: ['style', 'class', 'width', 'height'] });
    }
    if (document.head) {
      observer.observe(document.head, { childList: true, subtree: true, attributes: true });
    }
  }

  // ===========================================================================
  // 4. Part A — Scenario 02: Network Request Commenting (fetch triggers)
  // ===========================================================================
  const btnFetchUserProfile = document.getElementById('btn-fetch-user-profile');
  const btnFetchProducts = document.getElementById('btn-fetch-products');
  const btnFetchDeprecated = document.getElementById('btn-fetch-deprecated');
  const netStatusBadge = document.getElementById('net-status-badge');
  const netRequestUrl = document.getElementById('net-request-url');
  const netLatency = document.getElementById('net-latency');
  const networkResponsePreview = document.getElementById('network-response-preview');

  const triggerNetworkRequest = async (url) => {
    const startTime = performance.now();
    if (netStatusBadge) {
      netStatusBadge.className = 'net-badge net-badge-idle';
      netStatusBadge.textContent = 'LOADING...';
    }
    if (netRequestUrl) {
      netRequestUrl.textContent = `GET ${url}`;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-DevTools-Playground': 'true'
        },
        cache: 'no-store'
      });

      const elapsedMs = Math.round(performance.now() - startTime);
      if (netLatency) {
        netLatency.textContent = `${elapsedMs} ms`;
      }

      if (!response.ok) {
        if (netStatusBadge) {
          netStatusBadge.className = 'net-badge net-badge-error';
          netStatusBadge.textContent = `${response.status} ${response.statusText || 'ERROR'}`;
        }
        const errorPayload = {
          error: true,
          httpStatus: response.status,
          statusText: response.statusText || 'Not Found',
          requestedEndpoint: url,
          message: `Endpoint '${url}' returned HTTP ${response.status}. Inspect this request row in the Chrome DevTools Network panel to leave a comment.`,
          timestamp: new Date().toISOString()
        };
        if (networkResponsePreview) {
          networkResponsePreview.textContent = JSON.stringify(errorPayload, null, 2);
        }
        updateDiagnostics();
        return;
      }

      const data = await response.json();
      if (netStatusBadge) {
        netStatusBadge.className = 'net-badge net-badge-ok';
        netStatusBadge.textContent = `${response.status} OK`;
      }
      if (networkResponsePreview) {
        networkResponsePreview.textContent = JSON.stringify(data, null, 2);
      }
      updateDiagnostics();
    } catch (err) {
      const elapsedMs = Math.round(performance.now() - startTime);
      if (netLatency) {
        netLatency.textContent = `${elapsedMs} ms`;
      }
      if (netStatusBadge) {
        netStatusBadge.className = 'net-badge net-badge-error';
        netStatusBadge.textContent = 'NETWORK ERR';
      }
      if (networkResponsePreview) {
        networkResponsePreview.textContent = JSON.stringify({
          error: true,
          requestedEndpoint: url,
          details: String(err)
        }, null, 2);
      }
    }
  };

  if (btnFetchUserProfile) {
    btnFetchUserProfile.addEventListener('click', () => {
      triggerNetworkRequest('api/user-profile.json');
    });
  }

  if (btnFetchProducts) {
    btnFetchProducts.addEventListener('click', () => {
      triggerNetworkRequest('api/products.json?limit=5&currency=USD');
    });
  }

  if (btnFetchDeprecated) {
    btnFetchDeprecated.addEventListener('click', () => {
      triggerNetworkRequest('api/deprecated-endpoint.json');
    });
  }

  // ===========================================================================
  // 5. Part A — Scenario 03: Sources Panel Discount Calculator
  // ===========================================================================
  const BASE_SUBTOTAL = 100;
  const PROMO_RATE = 0.20;
  const discountSubtotalEl = document.getElementById('discount-subtotal-readout');
  const discountCodeEl = document.getElementById('discount-code-readout');
  const discountTotalEl = document.getElementById('discount-total-readout');
  const btnApplyDiscount = document.getElementById('btn-apply-discount');
  const btnResetDiscount = document.getElementById('btn-reset-discount');

  if (btnApplyDiscount) {
    btnApplyDiscount.addEventListener('click', () => {
      const finalTotal = calculateDiscountedTotal(BASE_SUBTOTAL, PROMO_RATE);
      if (discountSubtotalEl) discountSubtotalEl.textContent = `$${BASE_SUBTOTAL.toFixed(2)}`;
      if (discountCodeEl) discountCodeEl.textContent = 'DEVTOOLS20 (20%)';
      if (discountTotalEl) discountTotalEl.textContent = `$${finalTotal.toFixed(2)}`;
      updateDiagnostics();
    });
  }

  if (btnResetDiscount) {
    btnResetDiscount.addEventListener('click', () => {
      if (discountSubtotalEl) discountSubtotalEl.textContent = `$${BASE_SUBTOTAL.toFixed(2)}`;
      if (discountCodeEl) discountCodeEl.textContent = 'NONE (0%)';
      if (discountTotalEl) discountTotalEl.textContent = `$${BASE_SUBTOTAL.toFixed(2)}`;
      updateDiagnostics();
    });
  }

  // ===========================================================================
  // 6. Part B — Card 1: Pricing & Plan Selector
  // ===========================================================================
  const btnBillingMonthly = document.getElementById('btn-billing-monthly');
  const btnBillingAnnual = document.getElementById('btn-billing-annual');
  const priceStarter = document.getElementById('price-value-starter');
  const pricePro = document.getElementById('price-value-pro');
  const priceEnterprise = document.getElementById('price-value-enterprise');
  const periodStarter = document.getElementById('price-period-starter');
  const periodPro = document.getElementById('price-period-pro');
  const periodEnterprise = document.getElementById('price-period-enterprise');
  const pricingStatus = document.getElementById('pricing-selection-status');

  let isAnnual = false;
  let selectedPlanName = 'Pro Plan';

  const updatePricingDisplay = () => {
    const proAmount = isAnnual ? '$23' : '$29';
    const entAmount = isAnnual ? '$79' : '$99';
    const periodLabel = isAnnual ? '/ month (billed annually)' : '/ month';

    if (priceStarter) priceStarter.textContent = '$0';
    if (pricePro) pricePro.textContent = proAmount;
    if (priceEnterprise) priceEnterprise.textContent = entAmount;

    if (periodStarter) periodStarter.textContent = '/ month';
    if (periodPro) periodPro.textContent = periodLabel;
    if (periodEnterprise) periodEnterprise.textContent = periodLabel;

    updatePricingStatusText();
  };

  const updatePricingStatusText = () => {
    if (!pricingStatus) return;
    let activePrice = '$29 / month';
    if (selectedPlanName === 'Starter Plan') {
      activePrice = '$0 / month';
    } else if (selectedPlanName === 'Pro Plan') {
      activePrice = isAnnual ? '$23 / month (billed annually)' : '$29 / month';
    } else if (selectedPlanName === 'Enterprise Plan') {
      activePrice = isAnnual ? '$79 / month (billed annually)' : '$99 / month';
    }
    pricingStatus.innerHTML = `Active Selection: <strong>${selectedPlanName} (${activePrice})</strong> — Ready for deployment.`;
  };

  if (btnBillingMonthly && btnBillingAnnual) {
    btnBillingMonthly.addEventListener('click', () => {
      isAnnual = false;
      btnBillingMonthly.classList.add('active');
      btnBillingAnnual.classList.remove('active');
      updatePricingDisplay();
    });

    btnBillingAnnual.addEventListener('click', () => {
      isAnnual = true;
      btnBillingAnnual.classList.add('active');
      btnBillingMonthly.classList.remove('active');
      updatePricingDisplay();
    });
  }

  const planButtons = [
    { btnId: 'btn-select-starter', cardId: 'plan-card-starter', name: 'Starter Plan' },
    { btnId: 'btn-select-pro', cardId: 'plan-card-pro', name: 'Pro Plan' },
    { btnId: 'btn-select-enterprise', cardId: 'plan-card-enterprise', name: 'Enterprise Plan' }
  ];

  for (const planItem of planButtons) {
    const btnEl = document.getElementById(planItem.btnId);
    if (btnEl) {
      btnEl.addEventListener('click', () => {
        selectedPlanName = planItem.name;
        for (const p of planButtons) {
          const cardEl = document.getElementById(p.cardId);
          if (cardEl) {
            if (p.cardId === planItem.cardId) {
              cardEl.classList.add('tier-featured');
            } else {
              cardEl.classList.remove('tier-featured');
            }
          }
        }
        updatePricingStatusText();
      });
    }
  }

  // ===========================================================================
  // 7. Part B — Card 2: Interactive Counter & Step Multiplier
  // ===========================================================================
  let count = 0;
  let totalClicks = 0;
  let stepMultiplier = 1;

  const counterValueEl = document.getElementById('counter-value');
  const counterClicksEl = document.getElementById('counter-clicks');
  const counterStepIndicator = document.getElementById('counter-step-indicator');
  const decrementBtn = document.getElementById('btn-decrement');
  const incrementBtn = document.getElementById('btn-increment');
  const resetBtn = document.getElementById('btn-reset');
  const stepBtns = [
    document.getElementById('btn-step-1'),
    document.getElementById('btn-step-5'),
    document.getElementById('btn-step-10')
  ];

  const renderCounter = () => {
    if (counterValueEl) counterValueEl.textContent = String(count);
    if (counterClicksEl) {
      counterClicksEl.textContent = `${totalClicks} interaction${totalClicks === 1 ? '' : 's'}`;
    }
    if (counterStepIndicator) {
      counterStepIndicator.textContent = `Step: +${stepMultiplier}`;
    }
  };

  for (const stepBtn of stepBtns) {
    if (stepBtn) {
      stepBtn.addEventListener('click', () => {
        const parsed = Number(stepBtn.getAttribute('data-step')) || 1;
        stepMultiplier = parsed;
        for (const b of stepBtns) {
          if (b) b.classList.remove('active');
        }
        stepBtn.classList.add('active');
        renderCounter();
      });
    }
  }

  if (decrementBtn) {
    decrementBtn.addEventListener('click', () => {
      count -= stepMultiplier;
      totalClicks += 1;
      renderCounter();
      updateDiagnostics();
    });
  }

  if (incrementBtn) {
    incrementBtn.addEventListener('click', () => {
      count += stepMultiplier;
      totalClicks += 1;
      renderCounter();
      updateDiagnostics();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      count = 0;
      totalClicks += 1;
      renderCounter();
      updateDiagnostics();
    });
  }

  // ===========================================================================
  // 8. Part B — Card 3: Interactive Task / Issue Tracker
  // ===========================================================================
  const taskInput = document.getElementById('task-input');
  const taskPrioritySelect = document.getElementById('task-priority-select');
  const addTaskBtn = document.getElementById('btn-add-task');
  const itemListEl = document.getElementById('sandbox-item-list');
  const filterBtns = [
    document.getElementById('filter-all'),
    document.getElementById('filter-active'),
    document.getElementById('filter-completed')
  ];

  let currentFilter = 'all';
  let items = [
    { id: 101, title: 'Verify DevTools Elements panel comment anchor resolution', priority: 'High', completed: false },
    { id: 102, title: 'Test Network panel request row comment payload', priority: 'High', completed: true },
    { id: 103, title: 'Inspect Sources panel line-level comment in app.js', priority: 'Medium', completed: false },
    { id: 104, title: 'Audit button contrast ratio in dark mode theme', priority: 'Low', completed: false }
  ];

  const renderList = () => {
    if (!itemListEl) return;
    itemListEl.innerHTML = '';

    const filtered = items.filter((item) => {
      if (currentFilter === 'active') return !item.completed;
      if (currentFilter === 'completed') return item.completed;
      return true;
    });

    for (const item of filtered) {
      const li = document.createElement('li');
      li.className = `list-item${item.completed ? ' completed' : ''}`;
      li.id = `task-row-${item.id}`;

      const labelDiv = document.createElement('div');
      labelDiv.className = 'list-item-text';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `item-check-${item.id}`;
      checkbox.checked = item.completed;
      checkbox.addEventListener('change', () => {
        item.completed = checkbox.checked;
        renderList();
      });

      const priorityBadge = document.createElement('span');
      priorityBadge.className = `priority-tag priority-${item.priority}`;
      priorityBadge.textContent = item.priority;

      const titleLabel = document.createElement('label');
      titleLabel.htmlFor = `item-check-${item.id}`;
      titleLabel.className = 'list-item-title';
      titleLabel.textContent = item.title;

      labelDiv.appendChild(checkbox);
      labelDiv.appendChild(priorityBadge);
      labelDiv.appendChild(titleLabel);

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn-icon';
      deleteBtn.id = `btn-delete-${item.id}`;
      deleteBtn.textContent = 'Remove';
      deleteBtn.setAttribute('aria-label', `Remove ${item.title}`);
      deleteBtn.addEventListener('click', () => {
        items = items.filter((i) => i.id !== item.id);
        renderList();
      });

      li.appendChild(labelDiv);
      li.appendChild(deleteBtn);
      itemListEl.appendChild(li);
    }
  };

  for (const filterBtn of filterBtns) {
    if (filterBtn) {
      filterBtn.addEventListener('click', () => {
        currentFilter = filterBtn.getAttribute('data-filter') || 'all';
        for (const b of filterBtns) {
          if (b) b.classList.remove('active');
        }
        filterBtn.classList.add('active');
        renderList();
      });
    }
  }

  const addNewItem = () => {
    if (!taskInput) return;
    const val = taskInput.value.trim();
    if (!val) return;
    const priorityVal = taskPrioritySelect ? taskPrioritySelect.value : 'Medium';
    items.unshift({
      id: Date.now(),
      title: val,
      priority: priorityVal,
      completed: false
    });
    taskInput.value = '';
    renderList();
  };

  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', addNewItem);
  }
  if (taskInput) {
    taskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addNewItem();
      }
    });
  }

  renderList();

  // ===========================================================================
  // 9. Part B — Card 4: Account Settings & Notification Preferences Form
  // ===========================================================================
  const testForm = document.getElementById('sandbox-test-form');
  const payloadPreview = document.getElementById('form-payload-preview');
  const formAlert = document.getElementById('form-alert-banner');
  const btnResetForm = document.getElementById('btn-reset-form');

  const serializeFormState = () => {
    if (!testForm || !payloadPreview) return;
    const formData = new FormData(testForm);
    const payload = {
      fullName: formData.get('fullName'),
      emailAddress: formData.get('emailAddress'),
      environment: formData.get('environment'),
      digestFrequency: formData.get('digestFrequency'),
      automaticWorkspaceEnabled: formData.get('allowlistToggle') === 'on',
      webhookNotifications: formData.get('webhookNotifications') === 'on',
      updatedAt: new Date().toISOString()
    };
    payloadPreview.textContent = JSON.stringify(payload, null, 2);
  };

  if (testForm) {
    serializeFormState();
    testForm.addEventListener('input', serializeFormState);
    testForm.addEventListener('submit', (e) => {
      e.preventDefault();
      serializeFormState();
      if (formAlert) {
        formAlert.classList.add('visible');
        setTimeout(() => {
          formAlert.classList.remove('visible');
        }, 3500);
      }
    });
  }

  if (btnResetForm && testForm) {
    btnResetForm.addEventListener('click', () => {
      testForm.reset();
      serializeFormState();
    });
  }

  // ===========================================================================
  // 10. Part B — Card 5: Typography & Alert Banner Showcase
  // ===========================================================================
  const btnCycleAlerts = document.getElementById('btn-cycle-alerts');
  const alertBoxes = [
    document.getElementById('alert-banner-info'),
    document.getElementById('alert-banner-warning'),
    document.getElementById('alert-banner-success')
  ];
  let activeAlertIdx = -1;

  if (btnCycleAlerts) {
    btnCycleAlerts.addEventListener('click', () => {
      activeAlertIdx = (activeAlertIdx + 1) % alertBoxes.length;
      for (let i = 0; i < alertBoxes.length; i++) {
        const box = alertBoxes[i];
        if (box) {
          if (i === activeAlertIdx) {
            box.classList.add('highlighted');
          } else {
            box.classList.remove('highlighted');
          }
        }
      }
    });
  }
});
